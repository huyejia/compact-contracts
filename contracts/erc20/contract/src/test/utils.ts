import { tokenType, sampleContractAddress, ContractAddress } from '@midnight-ntwrk/compact-runtime';
import { type CoinInfo } from '../managed/erc20/contract/index.cjs';
import { encodeTokenType, encodeContractAddress, decodeCoinInfo, decodeTokenType } from '@midnight-ntwrk/onchain-runtime';

export const pad = (s: string, n: number): Uint8Array => {
  const encoder = new TextEncoder();
  const utf8Bytes = encoder.encode(s);
  if (n < utf8Bytes.length) {
    throw new Error(`The padded length n must be at least ${utf8Bytes.length}`);
  }
  const paddedArray = new Uint8Array(n);
  paddedArray.set(utf8Bytes);
  return paddedArray;
}

export const createCoinInfo = (nonce: Uint8Array, domain: Uint8Array, amount: bigint, addr: ContractAddress): CoinInfo => {
  return {
    nonce: nonce,
    color: encodeTokenType(tokenType(domain, addr)),
    value: amount
  }
}
