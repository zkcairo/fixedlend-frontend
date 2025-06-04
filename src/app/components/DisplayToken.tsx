import {
    // USDC
    USDC_ADDRESS,
    USDT_ADDRESS,
    DAI_ADDRESS,
    DAIV0_ADDRESS,
    NIMBORA_nsDAI_ADDRESS,
    NIMBORA_nstUSD_ADDRESS,
    // STRK
    STRK_ADDRESS,
    sSTRK_ADDRESS,
    nstStrk_ADDRESS,
} from "@/app/utils/constant";
import { prettyNameFromAddress } from "../utils/erc20";

type Props = {
    address: string;
};

const DisplayToken = ({ address }: Props) => {
    if (address === "") {
        return <>No asset selected</>;
    }
    return <>{prettyNameFromAddress(BigInt(address).toString(16))}</>;
    // let tokenName = "";
    
    // const hexaddress = BigInt(address);

    // if (hexaddress === BigInt(USDC_ADDRESS)) {
    //     tokenName = "USDC";
    // } else if (hexaddress === BigInt(USDT_ADDRESS)) {
    //     tokenName = "USDT";
    // } else if (hexaddress === BigInt(DAI_ADDRESS)) {
    //     tokenName = "DAI";
    // } else if (hexaddress === BigInt(DAIV0_ADDRESS)) {
    //     tokenName = "DAIV0";
    // } else if (hexaddress === BigInt(NIMBORA_nsDAI_ADDRESS)) {
    //     tokenName = "NIMBORA_nsDAI";
    // } else if (hexaddress === BigInt(NIMBORA_nstUSD_ADDRESS)) {
    //     tokenName = "NIMBORA_nstUSD";
    // }

    // if (tokenName !== "") {
    //     return <>{tokenName}</>;
    // }
}

export { DisplayToken };