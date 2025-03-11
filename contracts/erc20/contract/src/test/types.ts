import { type ZswapCoinPublicKey, type ContractAddress } from '../managed/erc20/contract/index.cjs';

export type ZswapOrContractAddress = {
    is_left: boolean,
    left: ZswapCoinPublicKey,
    right: ContractAddress
};

export type MaybeString = {
    is_some: boolean,
    value: string
}
