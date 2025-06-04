import {
    USDC_ADDRESS,
    USDT_ADDRESS,
    DAI_ADDRESS,
    DAIV0_ADDRESS,
    NIMBORA_nsDAI_ADDRESS,
    NIMBORA_nstUSD_ADDRESS,
} from "@/app/utils/constant";
import { prettyNameFromAddress } from "../utils/erc20";

type Props = {
    offer: any;
    me: boolean;
};

const DisplayCollateral = ({ offer, me }: Props) => {
    let tokenName = "";
    
    if (true) {
        tokenName = prettyNameFromAddress(BigInt(offer.token_collateral).toString(16));
        if (offer.is_allowance && me) {
            tokenName += " (from your wallet)";
        }
    }
    if (!offer.is_allowance && me) {
        tokenName = tokenName;
    }

    if (tokenName !== "") {
        return <>{tokenName}</>;
    }
}

export { DisplayCollateral };