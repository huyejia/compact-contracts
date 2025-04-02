import {
    type CoinPublicKey,
    decodeCoinPublicKey,
  } from '@midnight-ntwrk/compact-runtime';
  import { sampleCoinPublicKey } from '@midnight-ntwrk/zswap';
  import * as MockERC20Contract from '../artifacts/MockERC20/contract/index.cjs';
  import { ERC20ContractSimulator } from './simulator/ERC20Simulator';
import { MaybeString } from './types.js';
import * as utils from './utils.js';

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
const MAX_UINT128 = BigInt(2**128) - BigInt(1);

const OWNER = utils.createEitherTestUser('OWNER');
const RECIPIENT = utils.createEitherTestUser('RECIPIENT');
const SPENDER = utils.createEitherTestUser('SPENDER');
const SOME_CONTRACT = utils.createEitherTestContractAddress('SOME_CONTRACT');


let token: ERC20ContractSimulator;

describe('ERC20', () => {
  beforeEach(() => {
    token = new ERC20ContractSimulator(NAME, SYMBOL, DECIMALS);
  });

  describe('approve', () => {
    // TODO: change caller context to test IERC20 interface
    it.skip('should approve', () => {
      const initAllowance = token.allowance(OWNER, SPENDER);
      expect(initAllowance).toEqual(0n);

      token._mint(OWNER, AMOUNT);
      token.approve(SPENDER, AMOUNT);
    });
  })

  describe('mint', () => {
    it('should mint and update supply', () => {
      const initSupply = token.getCurrentPublicState().eRC20TotalSupply;
      expect(initSupply).toEqual(0n);

      let newState = token._mint(RECIPIENT, AMOUNT);
      expect(newState.eRC20TotalSupply).toEqual(AMOUNT);
      expect(token.balanceOf(RECIPIENT)).toEqual(AMOUNT);
      expect(token.getCurrentPublicState().eRC20TotalSupply).toEqual(AMOUNT);

      newState = token._transfer(RECIPIENT, OWNER, AMOUNT);
      expect(token.balanceOf(OWNER)).toEqual(AMOUNT);
      expect(token.balanceOf(RECIPIENT)).toEqual(0n);

      const toHex = Buffer.from("OWNER", 'ascii').toString('hex');
      const addy = String(toHex).padStart(64, '0');
      token.transfer(RECIPIENT, AMOUNT, addy);

      expect(token.balanceOf(OWNER)).toEqual(0n);
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

//  describe('burn', () => {
//    beforeEach(() => {
//      token._mint(OWNER, AMOUNT);
//    });
//
//    it('should burn tokens', () => {
//      token._burn(OWNER, 1n);
//
//      const afterBurn = AMOUNT - 1n;
//      expect(token.balanceOf(OWNER)).toEqual(afterBurn);
//      expect(token.getCurrentPublicState().eRC20TotalSupply).toEqual(afterBurn)
//    });
//
//    it('should throw when burning from zero', () => {
//      expect(() => {
//        token._burn(utils.ZERO_KEY, AMOUNT);
//      }).toThrow('ERC20: invalid sender');
//    });
//
//    it('should throw when burn amount is greater than balance', () => {
//      expect(() => {
//        token._burn(OWNER, AMOUNT + 1n);
//      }).toThrow('ERC20: insufficient balance');
//    });
//  });
//
//  describe('_update', () => {
//    it('should update from zero to non-zero (mint)', () => {
//      expect(token.getCurrentPublicState().eRC20TotalSupply).toEqual(0n);
//      expect(token.balanceOf(OWNER)).toEqual(0n);
//
//      token._update(utils.ZERO_KEY, OWNER, AMOUNT);
//
//      expect(token.getCurrentPublicState().eRC20TotalSupply).toEqual(AMOUNT);
//      expect(token.balanceOf(OWNER)).toEqual(AMOUNT);
//    });
//
//    describe('with minted tokens', () => {
//      beforeEach(() => {
//        token._update(utils.ZERO_ADDRESS, OWNER, AMOUNT);
//
//        expect(token.getCurrentPublicState().eRC20TotalSupply).toEqual(AMOUNT);
//        expect(token.balanceOf(OWNER)).toEqual(AMOUNT);
//      });
//
//      it('should update from non-zero to zero (burn)', () => {
//        token._update(OWNER, utils.ZERO_ADDRESS, AMOUNT);
//
//        expect(token.getCurrentPublicState().eRC20TotalSupply).toEqual(0n);
//        expect(token.balanceOf(OWNER)).toEqual(0n);
//      });
//
//      it('should update from non-zero to non-zero (transfer)', () => {
//        token._update(OWNER, RECIPIENT, AMOUNT - 1n);
//
//        expect(token.getCurrentPublicState().eRC20TotalSupply).toEqual(AMOUNT);
//        expect(token.balanceOf(OWNER)).toEqual(1n);
//        expect(token.balanceOf(RECIPIENT)).toEqual(AMOUNT - 1n);
//      });
//    });
//  });
});
