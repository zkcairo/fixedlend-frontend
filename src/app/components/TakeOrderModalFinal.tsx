"use client";
import GenericModal from "./GenericModal";
import Image from "next/image";
import { useEffect, useState } from "react";
import spinner from "../../../public/assets/spinner.svg";
import toast from "react-hot-toast";
import MyAbi from "../abi/mycontract.abi.json";
import { CONTRACT_ADDRESS, VALUE_1PERCENT_APY, PLATFORM_FEE_APY, SCALE_LTV, ETH_ADDRESS, FETH_ADDRESS } from '@/app/utils/constant';
import { formatTime, formatCurrency, formatYield } from "../utils/format";
import { useContractRead } from "@starknet-react/core";
import { prettyNameFromAddress, getDecimalsOfAsset } from "@/app/utils/erc20";
import { DisplayToken } from "./DisplayToken";
import ChooseAsset from "./ChooseAsset";
import SafetyBox from "./SafetyBox"; // Using a different safety box
import { getProtocolBalance } from "../utils/fetch";

type Props = { isOpen: boolean; onClose: () => void; account: any; offer: any; isLend: boolean; };

function TakeOrderModalFinal({ isOpen, onClose, account, offer, isLend }: Props) {
    const [choosenDuration, setChoosenDuration] = useState<number>(Number(offer.price.maximal_duration) / 3600);
    const [inputAmount, setInputAmount] = useState<string>("");
    const [acceptDisclaimer, setAcceptDisclaimer] = useState(false);
    const [choosenAsset, setChoosenAsset] = useState(isLend ? "" : ETH_ADDRESS);
    const [animate, setAnimate] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);

    const contractAddress = CONTRACT_ADDRESS;
    const { data: mylendingid_data } = useContractRead({ address: contractAddress, abi: MyAbi, functionName: "frontend_all_lend_offers_len", watch: true });
    const { data: myborrowingid_data } = useContractRead({ address: contractAddress, abi: MyAbi, functionName: "frontend_all_borrow_offers_len", watch: true });
    const { data: ltv_of_asset_data, isLoading: ltv_loading } = useContractRead({ address: contractAddress, abi: MyAbi, functionName: "frontend_get_ltv", args: [choosenAsset], watch: true });
    const { data: collateral_required_data, isLoading: collateral_loading } = useContractRead({ address: contractAddress, abi: MyAbi, functionName: "frontend_needed_amount_of_collateral", args: [choosenAsset, Number(inputAmount) * 1e10, Math.round(choosenDuration * 3600), Number(offer.price.rate) + PLATFORM_FEE_APY], watch: true, });

    const protocol_balance_feth = getProtocolBalance(FETH_ADDRESS, account.address);
    const collateral_required = Number(collateral_required_data) * 1e8;

    const closeModal = (e?: React.MouseEvent<HTMLElement>) => { if (e) e.stopPropagation(); setAnimate(false); setTimeout(onClose, 400); };
    useEffect(() => { if (isOpen) setAnimate(true); }, [isOpen]);

    async function handleExecute() {
        setLoading(true);
        try {
            const myId = isLend ? Number(myborrowingid_data) : Number(mylendingid_data);
            const functionName = isLend ? "make_borrow_offer" : "make_lend_offer";
            const decimals = Number(getDecimalsOfAsset(prettyNameFromAddress(choosenAsset)));
            let calldata: any[] = [
                choosenAsset, (Number(inputAmount) * (10 ** decimals)).toString(), '0',
            ];
            if (!isLend) calldata.push('0', '0');
            calldata.push(
                (isLend ? Number(offer.price.rate) + PLATFORM_FEE_APY : Number(offer.price.rate) - PLATFORM_FEE_APY).toString(), '0',
                offer.price.minimal_duration.toString(), Math.round(choosenDuration * 3600).toString()
            );

            const calls = [
                { contractAddress, entrypoint: functionName, calldata },
                { contractAddress, entrypoint: "match_offer", calldata: [isLend ? offer.id.toString() : myId.toString(), isLend ? myId.toString() : offer.id.toString(), (Number(inputAmount) * (10 ** decimals)).toString(), '0'] },
                { contractAddress, entrypoint: isLend ? "disable_borrow_offer" : "disable_lend_offer", calldata: [myId.toString()] }
            ];
            await account.execute(calls);
            toast.success("Offer taken successfully!");
            closeModal();
        } catch (err: any) {
            toast.error("An error occurred taking the offer.");
            console.error(err.message);
        } finally {
            setLoading(false);
        }
    }

    const isButtonDisabled = isNaN(Number(inputAmount)) || Number(inputAmount) <= 0 || choosenAsset === "" || !acceptDisclaimer || (isLend && (collateral_loading || Number(protocol_balance_feth) <= collateral_required));

    return (
        <GenericModal isOpen={isOpen} onClose={closeModal} animate={animate} className="w-[90vw] md:w-[45rem] max-h-[90vh] p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold tracking-widest">Confirm Order</h1>
                <button onClick={closeModal} className="border border-green-500 w-8 h-8 flex items-center justify-center hover:bg-green-500 hover:text-black transition-all">X</button>
            </div>
            <div className="flex-grow overflow-y-auto pr-2 flex flex-col gap-4 text-lg">
                <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr] items-center gap-4">
                    <label>Max Amount:</label>
                    <span>{formatCurrency(Number(offer.amount_available))} ETH</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr] items-center gap-4">
                    <label htmlFor="amount">Amount to {isLend ? "borrow" : "lend"}:</label>
                    <input id="amount" type="text" value={inputAmount} onChange={e => setInputAmount(e.target.value)} placeholder="0.0" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr] items-center gap-4">
                    <label>Duration Range:</label>
                    <span>{formatTime(Number(offer.price.minimal_duration) / 3600)} - {formatTime(Number(offer.price.maximal_duration) / 3600)}</span>
                </div>
                 {isLend && (
                    <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr] items-center gap-4">
                        <label htmlFor="duration">Chosen Duration ({formatTime(choosenDuration)}):</label>
                        <input id="duration" type="range" min={Math.log2(Number(offer.price.minimal_duration)/3600)*100} max={Math.log2(Number(offer.price.maximal_duration)/3600)*100} value={Math.log2(choosenDuration)*100} onChange={e => setChoosenDuration(Math.pow(2, Number(e.target.value)/100))} />
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr] items-center gap-4">
                    <label>Yield (APR):</label>
                    <span>{formatYield(Number(offer.price.rate)) + (isLend ? 1 : -1)}%</span>
                </div>
                {isLend && <ChooseAsset type="borrow" baseAsset={prettyNameFromAddress(offer.token.toString(16))} address={account.address} above_choosenAsset={choosenAsset} set_above_choosenAsset={setChoosenAsset} />}
                {isLend && (
                    <>
                        <hr className="border-green-500/30 my-2" />
                        <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr] items-center gap-4"><label>LTV:</label><span>{ltv_loading ? "..." : `${Number(ltv_of_asset_data)/SCALE_LTV}%`}</span></div>
                        <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr] items-center gap-4"><label>Collateral Required:</label><span>{collateral_loading ? "..." : formatCurrency(collateral_required)} <DisplayToken address={choosenAsset}/></span></div>
                        <hr className="border-green-500/30 my-2" />
                    </>
                )}
                <SafetyBox valueamount={Number(inputAmount)} valueyield={Number(offer.price.rate)} minimal_duration={Number(offer.price.minimal_duration)/3600} maximal_duration={choosenDuration} type={isLend ? "borrow" : "lend"} takeormake={true} isvalid={acceptDisclaimer} set_isvalid={setAcceptDisclaimer} />
            </div>
            <button className="w-full mt-6 py-3 font-bold text-xl" onClick={handleExecute} disabled={isButtonDisabled || loading}>
                {loading ? "PROCESSING..." : `[ CONFIRM ${isLend ? "BORROW" : "LEND"} ]`}
            </button>
        </GenericModal>
    );
}

export default TakeOrderModalFinal;