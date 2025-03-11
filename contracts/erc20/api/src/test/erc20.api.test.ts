//import { STATE } from '@midnight-ntwrk/erc20-contract';
import { CompactError } from '@midnight-ntwrk/compact-runtime';
import { Transaction, type Resource } from '@midnight-ntwrk/wallet';
import { type Wallet } from '@midnight-ntwrk/wallet-api';
import { webcrypto } from 'crypto';
import path from 'path';
import { ERC20API, type ERC20Providers } from '..';
import { TestEnvironment, TestProviders } from './commons';
import { currentDir } from './config';
import { createLogger } from './logger-utils';
import { Transaction as ZswapTransaction } from '@midnight-ntwrk/zswap';
import {
  type BalancedTransaction,
  createBalancedTx,
  type MidnightProvider,
  type UnbalancedTransaction,
  type WalletProvider,
} from '@midnight-ntwrk/midnight-js-types';
import { ZswapCoinPublicKey } from '@openzeppelin-midnight-contracts/erc20-contract';


const logDir = path.resolve(currentDir, '..', 'logs', 'tests', `${new Date().toISOString()}.log`);
const logger = await createLogger(logDir);

// @ts-expect-error It is required
globalThis.crypto = webcrypto;

globalThis.WebSocket = WebSocket;

describe('ERC20 API', () => {
  let testEnvironment: TestEnvironment;
  let wallet: Wallet & Resource;
  let providers: ERC20Providers;

  const allASCIIString = Array.from({ length: 128 }, (_, i) => String.fromCharCode(i)).join('');
  const AMOUNT = BigInt(250);

  beforeAll(
    async () => {
      testEnvironment = new TestEnvironment(logger);
      const testConfiguration = await testEnvironment.start();
      wallet = await testEnvironment.getWallet();
      providers = await new TestProviders().configureProviders(wallet, testConfiguration.dappConfig);
    },
    1000 * 60 * 45,
  );

  afterAll(async () => {
    await testEnvironment.shutdown();
  });

  it('should deploy the contract [@slow][@smoke]', async () => {
    allure.description(`Deploys the erc20 contract.`);
    allure.tms('PM-8572', 'PM-8572');
    allure.severity('blocker');
    allure.tag('erc20');

    const erc20API = await ERC20API.deploy(providers, logger);
    erc20API.state$
      .subscribe((erc20State) => {
        expect(erc20State.name?.toString()).toEqual('');
        expect(erc20State.symbol?.toString()).toEqual('');
        expect(erc20State.decimals).toEqual(0);
        expect(erc20State.supply).toEqual(0);
        expect(erc20State.nonce).toEqual(0);
        expect(erc20State.counter).toEqual(0);
        expect(erc20State.domain.toString()).toEqual('');
      })
      .unsubscribe();

      await erc20API.mintToCaller(AMOUNT);

    erc20API.state$
      .subscribe((erc20State) => {
        expect(erc20State.supply).toEqual(AMOUNT);
      })
      .unsubscribe();
    });
  });
