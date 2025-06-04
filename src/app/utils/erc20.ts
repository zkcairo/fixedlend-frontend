import Erc20Abi from "../abi/token.abi.json";
import { useContractRead } from "@starknet-react/core";
// Category
import { ETH_CATEGORY, USDC_CATEGORY, STRK_CATEGORY } from './constant';
// ETH
import { ETH_ADDRESS, FETH_ADDRESS} from './constant';
import { ETH_DECIMALS, FETH_DECIMALS } from './constant';
// USDC
import { USDC_ADDRESS, USDT_ADDRESS, DAI_ADDRESS, DAIV0_ADDRESS, NIMBORA_nsDAI_ADDRESS, NIMBORA_nstUSD_ADDRESS } from './constant';
import { USDC_DECIMALS, USDT_DECIMALS, DAI_DECIMALS, DAIV0_DECIMALS, NIMBORA_nsDAI_DECIMALS, NIMBORA_nstUSD_DECIMALS } from './constant';
// STRK
import { STRK_ADDRESS, sSTRK_ADDRESS, nstStrk_ADDRESS } from './constant';
import { STRK_DECIMALS, sSTRK_DECIMALS, nstStrk_DECIMALS } from './constant';

const balance_to_amount = (_v: any) => {
    if (_v === undefined) {
        return 0;
    }
    let v = _v.balance;
    const low = Number(v.low);
    const high = Number(v.high);
    console.log(_v);
    return low + high * 2 ** 128;
}

export const getAllLend = (address: string) => {
    if (address === "ETH") {
        return [
            [ETH_ADDRESS, ETH_DECIMALS],
        ];
    }
    // if (address === "USDC") {
    //     return [
    //         [USDC_ADDRESS, USDC_DECIMALS],
    //         [USDT_ADDRESS, USDT_DECIMALS],
    //         [DAI_ADDRESS, DAI_DECIMALS],
    //         [DAIV0_ADDRESS, DAIV0_DECIMALS],
    //     ];
    // }
    // if (address === "STRK") {
    //     return [
    //         [STRK_ADDRESS, STRK_DECIMALS],
    //     ];
    // }
    if (address === "") { return []; }
    //throw new Error("No lend found for this address");
    return [];
}

export const getAllCollateral = (address: string) => {
    if (address === "ETH") {
        return [
            [FETH_ADDRESS, FETH_DECIMALS],
        ];
    }
    // if (address === "USDC") {
    //     return [
    //         // [NIMBORA_nsDAI_ADDRESS, NIMBORA_nsDAI_DECIMALS],
    //         // [NIMBORA_nstUSD_ADDRESS, NIMBORA_nstUSD_DECIMALS],
    //     ];
    // }
    // if (address === "STRK") {
    //     return [
    //         [sSTRK_ADDRESS, sSTRK_DECIMALS],
    //         [nstStrk_ADDRESS, nstStrk_DECIMALS],
    //     ];
    // }
    if (address === "") { return []; }
    //throw new Error("No collaterals found for this address");
    return [];
}

export function getAllBalance(arrayAddress: string[], account: string) {
    let balance: number[] = [];
    for (const address of arrayAddress) {
        balance.push(balance_to_amount(getBalance(address, account)));
    }
    return balance;
}

export function getBalance(erc20_address: string, user_address: string) {
    const { data: value, isLoading: ethLoading } = useContractRead({
        address: erc20_address,
        abi: Erc20Abi,
        functionName: "balance_of",
        args: [user_address],
        watch: true,
    });
    return value;
}

export function categoryName(category: number) {
    switch (String(category)) {
        case ETH_CATEGORY:
            return "ETH";
        case USDC_CATEGORY:
            return "USDC";
        case STRK_CATEGORY:
            return "STRK";
        default:
            return String(category);
    }
}

export function prettyNameFromAddress(address_: string) {
    //check address length
    let address = address_;
    if (address_.length !== 2+64 || address_.slice(0, 2) !== "0x") {
        // Add 0 to it to make it legnth 64
        address = "0x" + "0".repeat(64 - address_.length) + address_;
    }
    address = address.toLowerCase();

    switch (address) {
        // ETH MARKET
        case ETH_ADDRESS:
            return "ETH";
        case FETH_ADDRESS:
            return "FETH";
        // USDC MARKET
        case USDC_ADDRESS:
            return "USDC";
        case USDT_ADDRESS:
            return "USDT";
        case DAI_ADDRESS:
            return "DAI";
        case DAIV0_ADDRESS:
            return "DAIv0";
        case NIMBORA_nsDAI_ADDRESS:
            return "NIMBORA_nsDAI";
        case NIMBORA_nstUSD_ADDRESS:
            return "NIMBORA_nstUSD";
        case STRK_ADDRESS:
            return "STRK";
        case sSTRK_ADDRESS:
            return "sSTRK (Nimbora)";
        case nstStrk_ADDRESS:
            return "nstStrk (Nostra)";
        default:
            return address;
    }
}

export function normalizeAmountLend(value: any, decimals: any) {
    return (10 ** 18 * value) / (10 ** decimals);
}
// Todo, read TLV
export function normalizeAmountBorrow(value: any, decimals: any) {
    return (10 ** 18 * value) / (10 ** decimals);
}

export const getDecimalsOfAsset = (asset: string) => {
    switch (asset) {
        case "FETH":
            return ETH_DECIMALS;
        case "ETH":
            return FETH_DECIMALS;
        case "USDC":
            return USDC_DECIMALS;
        case "USDT":
            return USDT_DECIMALS;
        case "DAI":
            return DAI_DECIMALS;
        case "DAIv0":
            return DAIV0_DECIMALS;
        case "NIMBORA_nsDAI":
            return NIMBORA_nsDAI_DECIMALS;
        case "NIMBORA_nstUSD":
            return NIMBORA_nstUSD_DECIMALS;
        default:
            -1;//    throw new Error(`Unknown asset: ${asset}`);
  }
}