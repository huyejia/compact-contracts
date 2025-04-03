import {
    type CircuitContext,
    CoinPublicKey,
    type ContractState,
    QueryContext,
    constructorContext,
    emptyZswapLocalState,
  } from '@midnight-ntwrk/compact-runtime';
  import { sampleContractAddress } from '@midnight-ntwrk/zswap';
  import {
    type Ledger,
    Contract as MockERC20,
    ledger,
    Either,
    ZswapCoinPublicKey,
    ContractAddress,
  } from './../artifacts/MockERC20/contract/index.cjs'; // Combined imports
import { MaybeString } from './types.js';
import type { IContractSimulator } from './../types';
import { ERC20PrivateState, ERC20Witnesses } from './../witnesses';

  /**
   * @description A simulator implementation of an erc20 contract for testing purposes.
   * @template P - The private state type, fixed to ERC20PrivateState.
   * @template L - The ledger type, fixed to Contract.Ledger.
   */
  export class ERC20ContractSimulator
    implements IContractSimulator<ERC20PrivateState, Ledger>
  {
    /** @description The underlying contract instance managing contract logic. */
    readonly contract: MockERC20<ERC20PrivateState>;

    /** @description The deployed address of the contract. */
    readonly contractAddress: string;

    /** @description The current circuit context, updated by contract operations. */
    circuitContext: CircuitContext<ERC20PrivateState>;

    /**
     * @description Initializes the mock contract.
     */
    constructor(name: MaybeString, symbol: MaybeString, decimals: bigint) {
      this.contract = new MockERC20<ERC20PrivateState>(
        ERC20Witnesses,
      );
      const {
        currentPrivateState,
        currentContractState,
        currentZswapLocalState,
      } = this.contract.initialState(
        constructorContext({}, '0'.repeat(64)), name, symbol, decimals,
      );
      this.circuitContext = {
        currentPrivateState,
        currentZswapLocalState,
        originalState: currentContractState,
        transactionContext: new QueryContext(
          currentContractState.data,
          sampleContractAddress(),
        ),
      };
      this.contractAddress = this.circuitContext.transactionContext.address;
    }

    /**
     * @description Retrieves the current public ledger state of the contract.
     * @returns The ledger state as defined by the contract.
     */
    public getCurrentPublicState(): Ledger {
      return ledger(this.circuitContext.transactionContext.state);
    }

    /**
     * @description Retrieves the current private state of the contract.
     * @returns The private state of type AccessContractPrivateState.
     */
    public getCurrentPrivateState(): ERC20PrivateState {
      return this.circuitContext.currentPrivateState;
    }

    /**
     * @description Retrieves the current contract state.
     * @returns The contract state object.
     */
    public getCurrentContractState(): ContractState {
      return this.circuitContext.originalState;
    }

  public balanceOf(account: Either<ZswapCoinPublicKey, ContractAddress>, sender?: CoinPublicKey): bigint {
    const res = this.contract.impureCircuits.balanceOf({
      ...this.circuitContext,
      currentZswapLocalState: sender
        ? emptyZswapLocalState(sender)
        : this.circuitContext.currentZswapLocalState,
    },
        account
    );
    this.circuitContext = res.context;
    return res.result;
  }

  public allowance(
    owner: Either<ZswapCoinPublicKey, ContractAddress>,
    spender: Either<ZswapCoinPublicKey, ContractAddress>,
    sender?: CoinPublicKey
  ): bigint {
    return this.contract.impureCircuits.allowance({
      ...this.circuitContext,
      currentZswapLocalState: sender
        ? emptyZswapLocalState(sender)
        : this.circuitContext.currentZswapLocalState,
    },
      owner, spender
    ).result;
  }

  public transfer(to: Either<ZswapCoinPublicKey, ContractAddress>, value: bigint, sender?: CoinPublicKey): boolean {
    const res = this.contract.impureCircuits.transfer({
        ...this.circuitContext,
        currentZswapLocalState: sender
          ? emptyZswapLocalState(sender)
          : this.circuitContext.currentZswapLocalState,
        }, to, value
    );

    this.circuitContext = res.context;
    return res.result;
  }

  public transferFrom(
    from: Either<ZswapCoinPublicKey, ContractAddress>,
    to: Either<ZswapCoinPublicKey, ContractAddress>,
    value: bigint,
    sender?: CoinPublicKey
  ): boolean {
    const res = this.contract.impureCircuits.transferFrom({
        ...this.circuitContext,
        currentZswapLocalState: sender
          ? emptyZswapLocalState(sender)
          : this.circuitContext.currentZswapLocalState,
        },
        from, to, value
    );

    this.circuitContext = res.context;
    return res.result;
  }

  public approve(spender: Either<ZswapCoinPublicKey, ContractAddress>, value: bigint, sender?: CoinPublicKey): boolean {
    const res = this.contract.impureCircuits.approve({
        ...this.circuitContext,
        currentZswapLocalState: sender
          ? emptyZswapLocalState(sender)
          : this.circuitContext.currentZswapLocalState,
        },
        spender, value
    );

    this.circuitContext = res.context;
    return res.result;
  }

  ///
  /// Internal
  ///

  /**
   * 
   * @param owner 
   * @param spender 
   * @param value 
   * @returns 
   */
  public _approve(
    owner: Either<ZswapCoinPublicKey, ContractAddress>,
    spender: Either<ZswapCoinPublicKey, ContractAddress>,
    value: bigint
  ) {
    this.circuitContext = this.contract.impureCircuits._approve(this.circuitContext, owner, spender, value).context;
  }

  public _transfer(
    from: Either<ZswapCoinPublicKey, ContractAddress>,
    to: Either<ZswapCoinPublicKey, ContractAddress>,
    value: bigint,
  ) {
    this.circuitContext = this.contract.impureCircuits._transfer(this.circuitContext, from, to, value).context;
  }

  public _mint(account: Either<ZswapCoinPublicKey, ContractAddress>, value: bigint) {
    this.circuitContext = this.contract.impureCircuits._mint(this.circuitContext, account, value).context;
  }

  public _burn(account: Either<ZswapCoinPublicKey, ContractAddress>, value: bigint) {
    this.circuitContext = this.contract.impureCircuits._burn(this.circuitContext, account, value).context;
  }

  public _update(
    from: Either<ZswapCoinPublicKey, ContractAddress>,
    to: Either<ZswapCoinPublicKey, ContractAddress>,
    value: bigint
  ) {
    this.circuitContext = this.contract.impureCircuits._update(this.circuitContext, from, to, value).context;
  }

  public _spendAllowance(
    owner: Either<ZswapCoinPublicKey, ContractAddress>,
    spender: Either<ZswapCoinPublicKey, ContractAddress>,
    value: bigint
  ) {
    this.circuitContext = this.contract.impureCircuits._spendAllowance(this.circuitContext, owner, spender, value).context;
  }

  public _isZero(address: Either<ZswapCoinPublicKey, ContractAddress>): boolean {
    return this.contract.circuits._isZero(this.circuitContext, address).result;
  }
}
