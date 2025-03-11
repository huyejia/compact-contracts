import { type CircuitContext, QueryContext, sampleContractAddress, constructorContext } from '@midnight-ntwrk/compact-runtime';
import { Contract, type Ledger, type CoinInfo, ledger, ZswapCoinPublicKey, ContractAddress } from '../managed/erc20/contract/index.cjs';
import { type ERC20PrivateState, witnesses } from '../witnesses.js';
import { ZswapOrContractAddress, MaybeString } from './types.js';
import { decodeContractAddress, encodeContractAddress } from '@midnight-ntwrk/ledger';

export class ERC20Mock {
  readonly contract: Contract<ERC20PrivateState>;
  readonly contractAddress: string;
  circuitContext: CircuitContext<ERC20PrivateState>;

  constructor(nonce: Uint8Array, name: MaybeString, symbol: MaybeString, decimals: bigint) {
    this.contract = new Contract<ERC20PrivateState>(witnesses);
    const { currentPrivateState, currentContractState, currentZswapLocalState } = this.contract.initialState(
      constructorContext({}, '0'.repeat(64)), nonce, name, symbol, decimals
    );
    this.circuitContext = {
      currentPrivateState,
      currentZswapLocalState,
      originalState: currentContractState,
      transactionContext: new QueryContext(currentContractState.data, sampleContractAddress()),
    };
    this.contractAddress = this.circuitContext.transactionContext.address;
  }

  public getLedger(): Ledger {
    return ledger(this.circuitContext.transactionContext.state);
  }

  public getPrivateState(): ERC20PrivateState {
    return this.circuitContext.currentPrivateState;
  }

  public mint(recipient: ZswapOrContractAddress , amount: bigint) {
    this.contract.impureCircuits.mint(this.circuitContext, recipient, amount);
  }

  public mintToCaller(amount: bigint): Ledger {
    this.circuitContext = this.contract.impureCircuits.mintToCaller(this.circuitContext, amount).context;
    return ledger(this.circuitContext.transactionContext.state);
  }

  public burn(coin: CoinInfo, amount: bigint): Ledger {
    this.circuitContext = this.contract.impureCircuits.burn(this.circuitContext, coin, amount).context;
    return ledger(this.circuitContext.transactionContext.state);
  }
}
