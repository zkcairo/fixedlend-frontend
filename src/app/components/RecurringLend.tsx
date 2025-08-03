"use client";
import GenericModal from "./GenericModal";
import Image from "next/image";
import { useEffect, useState } from "react";
import spinner from "../../../public/assets/spinner.svg";
import toast from "react-hot-toast";
import MyAbi from "../abi/mycontract.abi.json";
import { VALUE_1PERCENT_APY, PLATFORM_FEE_APY, CONTRACT_ADDRESS } from '@/app/utils/constant';
import { formatTime, formatYield } from "@/app/utils/format";
import { useContractRead } from "@starknet-react/core";
import { prettyNameFromAddress, getDecimalsOfAsset } from "@/app/utils/erc20";
import ChooseAsset from "./ChooseAsset";
import SafetyBox from "./SafetyBox"; // Using the new combined SafetyBox
import { matchBorrow, matchLend } from "../utils/matchMaking";
import { getProtocolBalance } from "../utils/fetch";
import { ETH_ADDRESS, FETH_ADDRESS } from "@/app/utils/constant";

type Props = { isOpen: boolean; onClose: () => void; account: any; tokenUsed: string; category: string; alloffers: any; disableBorrow: boolean; };

function RecurringLendModal({ isOpen, onClose, account, tokenUsed, category, alloffers, disableBorrow }: Props) {
    const [maximalDuration, setMaximalDuration] = useState<number>(30);
    const [wantedyield, setWantedYield] = useState<number>(5 * VALUE_1PERCENT_APY);
    const [inputAmount, setInputAmount] = useState<string>("");
    const [activeTab, setActiveTab] = useState("Recurring lend");
    const [choosenAsset, setChoosenAsset] = useState("");
    const [acceptDisclaimer, setAcceptDisclaimer] = useState(false);
    const [animate, setAnimate] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);

    const contractAddress = CONTRACT_ADDRESS;
    const isLend = activeTab === "Recurring lend";

    const protocol_balance_eth = Number(getProtocolBalance(ETH_ADDRESS, account.address));
    const protocol_balance_feth = Number(getProtocolBalance(FETH_ADDRESS, account.address));
    const maxYouCanLend = protocol_balance_eth / 1e18;
    const maxYouCanBorrow = 0.47 * protocol_balance_feth / 1e18; // Example LTV

    const { data: mylendingid_data, isLoading: mylendingid_loading } = useContractRead({ address: contractAddress, abi: MyAbi, functionName: "frontend_all_lend_offers_len", args: [], watch: true, });
    const { data: myborrowingid_data, isLoading: myborrowingid_loading } = useContractRead({ address: contractAddress, abi: MyAbi, functionName: "frontend_all_borrow_offers_len", args: [], watch: true, });
    
    const myid = isLend ? mylendingid_data : myborrowingid_data;

    const chooseOffer = { amount: (Number(inputAmount) || 0) * 1e18, price: { rate: 0, minimal_duration: 1, maximal_duration: Math.round(maximalDuration * 3600) } };
    const [list_of_offers_, obtainedYield] = isLend ? matchLend(chooseOffer, alloffers) : matchBorrow(chooseOffer, alloffers);
    const list_of_offers = list_of_offers_ as any[];

    const closeModal = (e?: React.MouseEvent<HTMLElement>) => { if (e) e.stopPropagation(); setAnimate(false); setTimeout(onClose, 400); };
    useEffect(() => { if (isOpen) setAnimate(true); }, [isOpen]);

    async function handleExecute() {
        setLoading(true);
        let success = false;
        try {
            const calls = [];
            for (let i = 0; i < list_of_offers.length; i++) {
                const current_offer = list_of_offers[i][0];
                const amount = list_of_offers[i][1];
                const myOfferId = Number(myid) + i;
                
                let calldata = [choosenAsset, amount.toString(), '0'];
                if (isLend) calldata.push('0', '0'); // Accepted collateral
                calldata.push(
                    Number(wantedyield).toString(), '0',
                    "1", // Minimal duration
                    Math.round(maximalDuration * 3600).toString()
                );

                calls.push({ contractAddress, entrypoint: isLend ? "make_lend_offer" : "make_borrow_offer", calldata });
                // calls.push({ contractAddress, entrypoint: "match_offer", calldata: isLend ? [myOfferId.toString(), current_offer.id.toString(), amount.toString(), '0'] : [current_offer.id.toString(), myOfferId.toString(), amount.toString(), '0'] });
                // calls.push({ contractAddress, entrypoint: isLend ? "disable_lend_offer" : "disable_borrow_offer", calldata: [myOfferId.toString()] });
            }
            await account.execute(calls);
            toast.success("Order executed successfully!");
            success = true;
        } catch (err: any) {
            toast.error("An error occurred during execution.");
            console.error(err.message);
        } finally {
            setLoading(false);
            if (success) closeModal();
        }
    }

    const toolarge = (isLend ? Number(inputAmount) > maxYouCanLend : Number(inputAmount) > maxYouCanBorrow);
    const isButtonDisabled = isNaN(Number(inputAmount)) || Number(inputAmount) <= 0 || !acceptDisclaimer || choosenAsset === "" || toolarge || (maximalDuration < 24) || obtainedYield === "";

    return (
        <GenericModal isOpen={isOpen} onClose={closeModal} animate={animate} className="w-[90vw] md:w-[50rem] max-h-[90vh] p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold tracking-widest">{activeTab} {tokenUsed}</h1>
                <button onClick={closeModal} className="border border-green-500 w-8 h-8 flex items-center justify-center hover:bg-green-500 hover:text-black transition-all">X</button>
            </div>
            {!disableBorrow && (
            <div className="flex justify-center gap-4 mb-6">
                <button className={isLend ? "buttonselected" : ""} onClick={() => { setChoosenAsset(""); setActiveTab("Recurring lend"); }}>Lend</button>
                <button className={!isLend ? "buttonselected" : ""} onClick={() => { setChoosenAsset(""); setActiveTab("Just borrow"); }}>Borrow</button>
            </div>
            )}
            <div className="flex-grow overflow-y-auto pr-2 flex flex-col gap-4 text-lg">
                <hr className="border-green-500/30 my-2" />
                <div className="w-full text-left text-lg leading-relaxed">
                    <p>{">"} By using this page, you <b>MAKE</b> an offer on FixedLend orderbook.</p>
                    <p>{">"} <a href="https://docs.fixedlend.com/fixedlend/main/lenders-guide#option-b-create-a-recurring-loan-offer" target="_blank">Here is a small guide to help you.</a></p>
                    <p>{">"} </p>
                    <p>{">"} (We recommend either 10days with 8.5%, or 3days with 7%).</p>
                    <p>{">"} If you have more questions, ask them in the <a href="https://t.me/+x1dXX6x0A3MzNGU0" target="_blank">Telegram group</a>.</p>
                </div>
                <hr className="border-green-500/30 my-2" />
                <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr] items-center gap-4">
                    <label>Max you can {isLend ? "lend" : "borrow"}:</label>
                    <span>{isLend ? maxYouCanLend.toFixed(18) : maxYouCanBorrow.toFixed(18)} {tokenUsed}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr] items-center gap-4">
                    <label htmlFor="amount">Amount ({tokenUsed}):</label>
                    <input id="amount" type="text" value={inputAmount} onChange={e => setInputAmount(e.target.value)} placeholder="0.0" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr] items-center gap-4">
                    <label htmlFor="max-duration">Max withdraw duration ({formatTime(maximalDuration)}):</label>
                    <input id="max-duration" type="range" min="465" max="1000" step="1" value={Math.log2(maximalDuration) * 100} onChange={(e) => setMaximalDuration(Math.pow(2, Number(e.target.value) / 100))} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr] items-center gap-4">
                    <label htmlFor="max-duration">Wanted yield ({formatYield(wantedyield)}%):</label>
                    <input id="max-duration" type="range" min={0} max={50 * VALUE_1PERCENT_APY} step={VALUE_1PERCENT_APY / 10} value={wantedyield} onChange={(e) => setWantedYield(Number(e.target.value))} />
                </div>
                <hr className="border-green-500/30 my-2" />
                <ChooseAsset type={isLend ? "lend" : "borrow"} baseAsset={tokenUsed} address={account.address} above_choosenAsset={choosenAsset} set_above_choosenAsset={setChoosenAsset} />
                <hr className="border-green-500/30 my-2" />
                <SafetyBox valueamount={Number(inputAmount)} valueyield={Number(wantedyield) || 0} minimal_duration={1} maximal_duration={maximalDuration} type={isLend ? "lend" : "borrow"} takeormake={true} isvalid={acceptDisclaimer} set_isvalid={setAcceptDisclaimer} />
            </div>
            <button className="w-full mt-6 py-3 font-bold text-xl" onClick={handleExecute} disabled={isButtonDisabled || loading}>
                {toolarge ? "Amount too large" : loading ? "PROCESSING..." : `[ MAKE A ${isLend ? "LEND" : "BORROW"} OFFER ]`}
            </button>
        </GenericModal>
    );
}

export default RecurringLendModal;