import { it, describe, expect } from '@jest/globals';
import { InitializableMock } from './initializable-setup.js';
import { NetworkId, setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

setNetworkId(NetworkId.Undeployed);

const contract = new InitializableMock();

describe('Initializable', () => {
    it('generates initial ledger state deterministically', () => {
      const contract2 = new InitializableMock();
      expect(contract.getLedger()).toEqual(contract2.getLedger());
    });

    it('properly initializes ledger state and private state', () => {
      const initialLedgerState = contract.getLedger();
      expect(initialLedgerState.state).toEqual(0);

      const initialPrivateState = contract.getPrivateState();
      expect(initialPrivateState).toEqual({});
    });

    it('initializes the state correctly', () => {
      const nextLedgerState = contract.initialize();
      expect(nextLedgerState.state).toEqual(1);

      const nextPrivateState = contract.getPrivateState();
      expect(nextPrivateState).toEqual({});
    });

    it('fails when re-initialized', () => {
      expect(() => {
          contract.initialize();
          contract.initialize();
      }).toThrow('Contract already initialized');
    });
  });
