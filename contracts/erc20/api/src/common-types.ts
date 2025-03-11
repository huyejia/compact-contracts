/**
 * ERC20 common types and abstractions.
 *
 * @module
 */

import { type MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { type FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import type { ERC20PrivateState, Contract, Witnesses, CoinInfo } from '@openzeppelin-midnight-contracts/erc20-contract';

/**
 * The private states consumed throughout the application.
 *
 * @remarks
 * {@link PrivateStates} can be thought of as a type that describes a schema for all
 * private states for all contracts used in the application. Each key represents
 * the type of private state consumed by a particular type of contract.
 * The key is used by the deployed contract when interacting with a private state provider,
 * and the type (i.e., `typeof PrivateStates[K]`) represents the type of private state
 * expected to be returned.
 *
 * Since there is only one contract type for ERC20, we only define a
 * single key/type in the schema.
 *
 * @public
 */
export type PrivateStates = {
  /**
   * Key used to provide the private state for {@link ERC20Contract} deployments.
   */
  readonly ERC20PrivateState: ERC20PrivateState;
};

/**
 * Represents an ERC20 contract and its private state.
 *
 * @public
 */
export type ERC20Contract = Contract<ERC20PrivateState, Witnesses<ERC20PrivateState>>;

/**
 * The keys of the circuits exported from {@link ERC20Contract}.
 *
 * @public
 */
export type ERC20CircuitKeys = Exclude<keyof ERC20Contract['impureCircuits'], number | symbol>;

/**
 * The providers required by {@link ERC20Contract}.
 *
 * @public
 */
export type ERC20Providers = MidnightProviders<ERC20CircuitKeys, PrivateStates>;

/**
 * A {@link ERC20Contract} that has been deployed to the network.
 *
 * @public
 */
export type DeployedERC20Contract = FoundContract<ERC20PrivateState, ERC20Contract>;

export type MaybeString = {
  is_some: boolean,
  value: string
}

/**
 * A type that represents the derived combination of public (or ledger), and private state.
 */
export type ERC20DerivedState = {
  readonly name: MaybeString;
  readonly symbol: MaybeString;
  readonly decimals: bigint;
  readonly nonce: Uint8Array;
  readonly supply: bigint;
  readonly domain: Uint8Array;
  readonly counter: bigint;
  readonly info: CoinInfo;
};
