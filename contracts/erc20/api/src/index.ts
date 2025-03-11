/**
 * Provides types and utilities for working with ERC20 contracts.
 *
 * @packageDocumentation
 */

import { type ContractAddress, type CoinPublicKey, tokenType, convert_bigint_to_Uint8Array } from '@midnight-ntwrk/compact-runtime';
import { type Logger } from 'pino';
import type { ERC20DerivedState, ERC20Contract, ERC20Providers, DeployedERC20Contract, MaybeString } from './common-types.js';
import {
  type ERC20PrivateState,
  Contract,
  createERC20PrivateState,
  ledger,
  pureCircuits,
  witnesses,
  type CoinInfo,
} from '@openzeppelin-midnight-contracts/erc20-contract';
import { encodeTokenType } from '@midnight-ntwrk/onchain-runtime';
import * as utils from './utils/index.js';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { combineLatest, map, tap, from, type Observable } from 'rxjs';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';

/** @internal */
const ERC20ContractInstance: ERC20Contract = new Contract(witnesses);

const NONCE: Uint8Array = utils.pad('NONCE', 32);
const NAME: MaybeString = {
  is_some: true,
  value: "NAME"
};
const SYMBOL: MaybeString = {
  is_some: true,
  value: "SYMBOL"
};
const DECIMALS: bigint = 18n;


/**
 * An API for a deployed ERC20 contract.
 */
export interface DeployedERC20API {
  readonly deployedContractAddress: ContractAddress;
  readonly state$: Observable<ERC20DerivedState>;

  //mint: (recipient: string) => void;
}

/**
 * Provides an implementation of {@link ERC20API} by adapting an ERC20 token contract.
 *
 * @remarks
 * The `ERC20PrivateState` is managed at the DApp level by a private state provider. As such, this
 * private state is shared between all instances of {@link ERC20API}, and their underlying deployed
 * contracts. The private state defines a `'secretKey'` property that effectively identifies the current
 * user, and is used to determine if the current user is the poster of the message as the observable
 * contract state changes.
 *
 */
// TODO: Update ERC20API to use contract level private state storage.
export class ERC20API implements DeployedERC20API {
  /** @internal */
  private constructor(
    public readonly deployedContract: DeployedERC20Contract,
    providers: ERC20Providers,
    private readonly logger?: Logger,
  ) {
    this.deployedContractAddress = deployedContract.deployTxData.public.contractAddress;
    this.state$ = combineLatest(
      [
        // Combine public (ledger) state with...
        providers.publicDataProvider.contractStateObservable(this.deployedContractAddress, { type: 'latest' }).pipe(
          map((contractState) => ledger(contractState.data)),
          tap((ledgerState) =>
            logger?.trace({
              ledgerStateChanged: {
                ledgerState: {
                  ...ledgerState,
                  name: ledgerState.name,
                  symbol: ledgerState.symbol,
                  decimals: ledgerState.decimals,
                  supply: ledgerState.totalSupply,
                  nonce: ledgerState.nonce,
                  domain: ledgerState.domain,
                  counter: ledgerState.counter,
                  info: ledgerState.info
                },
              },
            }),
          ),
        ),
        // ...private state...
        //    since the private state of the ERC20 application never changes, we can query the
        //    private state once and always use the same value with `combineLatest`. In applications
        //    where the private state is expected to change, we would need to make this an `Observable`.
        from(providers.privateStateProvider.get('ERC20PrivateState') as Promise<ERC20PrivateState>),
      ],
      // ...and combine them to produce the required derived state.
      (ledgerState, privateState) => {
        return {
          name: ledgerState.name,
          symbol: ledgerState.symbol,
          decimals: ledgerState.decimals,
          domain: ledgerState.domain,
          counter: ledgerState.counter,
          nonce: ledgerState.nonce,
          supply: ledgerState.totalSupply,
          info: ledgerState.info
        };
      },
    );
  }

  coin(amount: bigint): CoinInfo {
    return {
      nonce: NONCE,
      color: encodeTokenType(tokenType(utils.pad('ERC20', 32), this.deployedContractAddress)),
      value: amount,
    };
  }

  /**
   * Gets the address of the current deployed contract.
   */
  readonly deployedContractAddress: ContractAddress;

  /**
   * Gets an observable stream of state changes based on the current public (ledger),
   * and private state data.
   */
  readonly state$: Observable<ERC20DerivedState>;

  async mintToCaller(amount: bigint): Promise<void> {
    this.logger?.info(`Minting ${amount} tokens to caller`);
    const txData = await this.deployedContract.callTx.mintToCaller(amount);
    this.logger?.trace({
      transactionAdded: {
        circuit: 'mintToCaller',
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
  }

  async burn(amount: bigint): Promise<void> {
    this.logger?.info(`Burning ${amount} tokens from caller`);
    const _coin = this.coin(amount);
    const txData = await this.deployedContract.callTx.burn(_coin, amount);
    this.logger?.trace({
      transactionAdded: {
        circuit: 'burn',
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
  }

  /**
   * Deploys a new ERC20 contract to the network.
   *
   * @param providers The ERC20 providers.
   * @param logger An optional 'pino' logger to use for logging.
   * @returns A `Promise` that resolves with a {@link ERC20API} instance that manages the newly deployed
   * {@link DeployedERC20Contract}; or rejects with a deployment error.
   */
  static async deploy(providers: ERC20Providers, logger?: Logger): Promise<ERC20API> {
    logger?.info('deployContract');

    const deployedERC20Contract = await deployContract(providers, {
      privateStateKey: 'ERC20PrivateState',
      contract: ERC20ContractInstance,
      initialPrivateState: await ERC20API.getPrivateState(providers),
      args: [NONCE, NAME, SYMBOL, DECIMALS]
    });

    logger?.trace({
      contractDeployed: {
        finalizedDeployTxData: deployedERC20Contract.deployTxData.public,
      },
    });

    return new ERC20API(deployedERC20Contract, providers, logger);
  }

  /**
   * Finds an already deployed ERC20 contract on the network, and joins it.
   *
   * @param providers The bERC20 providers.
   * @param contractAddress The contract address of the deployed ERC20 contract to search for and join.
   * @param logger An optional 'pino' logger to use for logging.
   * @returns A `Promise` that resolves with a {@link ERC20API} instance that manages the joined
   * {@link DeployedERC20Contract}; or rejects with an error.
   */
  static async join(providers: ERC20Providers, contractAddress: ContractAddress, logger?: Logger): Promise<ERC20API> {
    logger?.info({
      joinContract: {
        contractAddress,
      },
    });

    const deployedERC20Contract = await findDeployedContract(providers, {
      contractAddress,
      contract: ERC20ContractInstance,
      privateStateKey: 'ERC20PrivateState',
      initialPrivateState: await ERC20API.getPrivateState(providers),
    });

    logger?.trace({
      contractJoined: {
        finalizedDeployTxData: deployedERC20Contract.deployTxData.public,
      },
    });

    return new ERC20API(deployedERC20Contract, providers, logger);
  }

  private static async getPrivateState(providers: ERC20Providers): Promise<ERC20PrivateState> {
    const existingPrivateState = await providers.privateStateProvider.get('ERC20PrivateState');
    //return existingPrivateState ?? createERC20PrivateState(utils.randomBytes(32));
    return existingPrivateState ?? createERC20PrivateState();
  }
}

/**
 * A namespace that represents the exports from the `'utils'` sub-package.
 *
 * @public
 */
export * as utils from './utils/index.js';

export * from './common-types.js';
