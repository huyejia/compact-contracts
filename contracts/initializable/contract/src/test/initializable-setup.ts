import { type CircuitContext, QueryContext, sampleContractAddress, constructorContext } from '@midnight-ntwrk/compact-runtime';
import { Contract, type Ledger, ledger } from '../managed/initializable/contract/index.cjs';
import { type InitializablePrivateState, witnesses } from '../witnesses.js';

export class InitializableMock {
  readonly contract: Contract<InitializablePrivateState>;
  circuitContext: CircuitContext<InitializablePrivateState>;

  constructor() {
    this.contract = new Contract<InitializablePrivateState>(witnesses);
    const { currentPrivateState, currentContractState, currentZswapLocalState } = this.contract.initialState(
      constructorContext({}, '0'.repeat(64)),
    );
    this.circuitContext = {
      currentPrivateState,
      currentZswapLocalState,
      originalState: currentContractState,
      transactionContext: new QueryContext(currentContractState.data, sampleContractAddress()),
    };
  }

  public getLedger(): Ledger {
    return ledger(this.circuitContext.transactionContext.state);
  }

  public getPrivateState(): InitializablePrivateState {
    return this.circuitContext.currentPrivateState;
  }

  public initialize(): Ledger {
    // Update the current context to be the result of executing the circuit.
    this.circuitContext = this.contract.impureCircuits.initialize(this.circuitContext).context;
    return ledger(this.circuitContext.transactionContext.state);
  }
}
