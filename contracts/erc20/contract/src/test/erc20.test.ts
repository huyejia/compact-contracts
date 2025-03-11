import { it, describe, expect } from '@jest/globals';
import { ERC20Mock } from './erc20-setup.js';
import { NetworkId, setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { MaybeString } from './types.js';
import { pad, createCoinInfo } from './utils';
import { sampleContractAddress } from '@midnight-ntwrk/ledger';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';
import { encodeTokenType, encodeCoinInfo, encodeContractAddress, decodeCoinInfo, decodeTokenType, decodeContractAddress, tokenType } from '@midnight-ntwrk/onchain-runtime';


//
// Test vals
//

const NONCE: Uint8Array = pad('NONCE', 32);
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
const DOMAIN: Uint8Array = pad('ERC20', 32);

const AMOUNT: bigint = BigInt(250);
const MAX_UINT64 = BigInt(2**64) - BigInt(1);


//
// Test
//

setNetworkId(NetworkId.Undeployed);
//const token = new ERC20Mock(NONCE, METADATA);
let token: any;

describe('ERC20', () => {
  beforeEach(async function () {
    token = new ERC20Mock(NONCE, NAME, SYMBOL, DECIMALS);
  });

  describe('initialize', () => {
    it('initializes the correct state', () => {
      const state = token.getLedger();

      expect(state.counter).toEqual(0n);
      expect(state.nonce).toEqual(NONCE);
      expect(state.domain).toEqual(DOMAIN);
      expect(state.totalSupply).toEqual(0n);
      expect(state.name).toEqual(NAME);
      expect(state.symbol).toEqual(SYMBOL);
      expect(state.decimals).toEqual(DECIMALS);
    });

    it('initializes no metadata state', () => {
      const zeroNonce = pad('0', 32);
      const noDecimals: bigint = 0n;

      const token = new ERC20Mock(zeroNonce, NO_STRING, NO_STRING, noDecimals);
      const state = token.getLedger();

      expect(state.counter).toEqual(0n);
      expect(state.nonce).toEqual(zeroNonce);
      expect(state.domain).toEqual(DOMAIN);
      expect(state.totalSupply).toEqual(0n);
      expect(state.name).toEqual(NO_STRING);
      expect(state.symbol).toEqual(NO_STRING);
      expect(state.decimals).toEqual(0n);
    });
  });

  // tmp - mintToCaller
  describe('mint', () => {
    it('should mint and update supply', () => {
      const initSupply = token.getLedger().totalSupply;
      expect(initSupply).toEqual(0n);

      const newState = token.mintToCaller(AMOUNT);
      expect(newState.totalSupply).toEqual(AMOUNT);

      const nextState = token.mintToCaller(AMOUNT);
      expect(nextState.totalSupply).toEqual(AMOUNT + AMOUNT);
    });

    it('should overflow', () => {
      // Passing in uints > u64:
      // "CompactError: Error: failed to decode for built-in type u64 after successful typecheck"
      // Also, the type is u128, but they're overflowing at u64?
      token.mintToCaller(MAX_UINT64);
      expect(() => {
        token.mintToCaller(BigInt(1))
      }).toThrow('Error: arithmetic overflow');
    });
  });

  describe('burn', () => {
    //beforeEach(() => {
    //  token.mintToCaller(AMOUNT);
    //});
    it('should mint and burn', () => {
      //const coinInfo = createCoinInfo(token.nonce, DOMAIN, AMOUNT, token.contractAddress);
      let res = token.mintToCaller(AMOUNT);
      //console.log("state info: ", res.info);
      res = token.mintToCaller(AMOUNT);
      //console.log("state info: ", res.info.color);
      const a = {
        nonce: NONCE,
        color: res.info.color,
        value: res.info.value
      };
      const f = tokenType(DOMAIN, token.contractAddress);
      console.log("local tt: ", f);
      console.log(res.tokenType);
    });
  });
});
