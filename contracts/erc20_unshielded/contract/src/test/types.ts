import { type ZswapCoinPublicKey, type ContractAddress, type Either } from '../managed/erc20_unshielded/contract/index.cjs';

export type ZswapOrContractAddress = {
    is_left: boolean,
    left: ZswapCoinPublicKey,
    right: ContractAddress
};

export type MaybeString = {
    is_some: boolean,
    value: string
}

export type ZOrAddress = {
    is_left: true,
    a: ZswapCoinPublicKey,
    b: ContractAddress
}
