import { it, describe, expect } from '@jest/globals';
import { ERC20Mock } from './erc20-setup.js';
import { NetworkId, setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { MaybeString } from './types.js';
import * as utils from './utils';

//
// Test vals
//

const NO_STRING: MaybeString = {
  is_some: false,
  value: ''
};
const NAME: MaybeString = {
  is_some: true,
  value: "NAME"
};
const SYMBOL: MaybeString = {
  is_some: true,
  value: "SYMBOL"
};
const DECIMALS: bigint = 18n;

const AMOUNT: bigint = BigInt(250);
const MAX_UINT64 = BigInt(2**64) - BigInt(1);
const MAX_UINT256 = BigInt(2**256) - BigInt(1);

const OWNER = utils.createEitherTestUser('OWNER');
const RECIPIENT = utils.createEitherTestUser('RECIPIENT');
const SPENDER = utils.createEitherTestUser('SPENDER');
const SOME_CONTRACT = utils.createEitherTestContractAddress('SOME_CONTRACT');

//
// Test
//

setNetworkId(NetworkId.Undeployed);
let token: any;

describe('ERC20', () => {
  beforeEach(() => {
    token = new ERC20Mock(NAME, SYMBOL, DECIMALS);
  });

  describe('initialize', () => {
    it('initializes the correct state', () => {
      const state = token.getLedger();

      expect(state.totalSupply).toEqual(0n);
      expect(state.name).toEqual(NAME);
      expect(state.symbol).toEqual(SYMBOL);
      expect(state.decimals).toEqual(DECIMALS);
    });

    it('initializes no metadata state', () => {
      const noDecimals: bigint = 0n;

      const token = new ERC20Mock(NO_STRING, NO_STRING, noDecimals);
      const state = token.getLedger();

      expect(state.totalSupply).toEqual(0n);
      expect(state.name).toEqual(NO_STRING);
      expect(state.symbol).toEqual(NO_STRING);
      expect(state.decimals).toEqual(0n);
    });
  });

  describe('approve', () => {
    it.skip('should approve', () => {
      // TODO: need to init mapping
      const initAllowance = token.allowance(OWNER, SPENDER);
      expect(initAllowance).toEqual(0n);

      token._mint(OWNER, AMOUNT);
      token.approve(SPENDER, AMOUNT);
    });
  })

  describe('mint', () => {
    it('should mint and update supply', () => {
      const initSupply = token.getLedger().totalSupply;
      expect(initSupply).toEqual(0n);

      token._mint(RECIPIENT, AMOUNT);
      expect(token.getLedger().totalSupply).toEqual(AMOUNT);
      expect(token.balanceOf(RECIPIENT)).toEqual(AMOUNT);
    });

    it('should not mint to zero pubkey', () => {
      expect(() => {
        token._mint(utils.ZERO_KEY, AMOUNT);
      }).toThrow('ERC20: invalid receiver');
    });

    it('should not mint to zero contract address', () => {
      expect(() => {
        token._mint(utils.ZERO_ADDRESS, AMOUNT);
      }).toThrow('ERC20: invalid receiver');
    });
  });
});
