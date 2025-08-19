"use client";
import GenericModal from "./GenericModal";
import Image from "next/image";
import { useEffect, useState } from "react";
import spinner from "../../../public/assets/spinner.svg";
import toast from "react-hot-toast";
import { VALUE_1PERCENT_APY, CONTRACT_ADDRESS, ETH_ADDRESS, FETH_ADDRESS } from '@/app/utils/constant';
import { formatTime, formatCurrency } from "@/app/utils/format";
import { prettyNameFromAddress, getDecimalsOfAsset } from "@/app/utils/erc20";
import ChooseAsset from "./ChooseAsset";
import SafetyBox from "./SafetyBox"; // Using a different safety box
import { getProtocolBalance } from "../utils/fetch";

type Props = { isOpen: boolean; onClose: () => void; account: any; tokenUsed: string; category: string; };

function MakeOrderModal({ isOpen, onClose, account, tokenUsed, category }: Props) {
    const [valueYield, setValueYield] = useState<number>(10);
    const [minimalDuration, setMinimalDuration] = useState<number>(24);
    const [maximalDuration, setMaximalDuration] = useState<number>(168);
    const [inputAmount, setInputAmount] = useState<string>("");
    const [activeTab, setActiveTab] = useState("Make a Lend Offer");
    const [choosenAsset, setChoosenAsset] = useState("");
    const [acceptDisclaimer, setAcceptDisclaimer] = useState(false);
    const [animate, setAnimate] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    
    const contractAddress = CONTRACT_ADDRESS;
    const isLend = activeTab === "Make a Lend Offer";

    const protocol_balance_eth = Number(getProtocolBalance(ETH_ADDRESS, account.address));
    const protocol_balance_feth = Number(getProtocolBalance(FETH_ADDRESS, account.address));
    const maxYouCanLend = protocol_balance_eth / 1e18;
    const maxYouCanBorrow = 0.47 * protocol_balance_feth / 1e18;

    const closeModal = (e?: React.MouseEvent<HTMLElement>) => { if (e) e.stopPropagation(); setAnimate(false); setTimeout(onClose, 400); };
    useEffect(() => { if (isOpen) setAnimate(true); }, [isOpen]);

    async function handleExecute() {
        setLoading(true);
        try {
            const functionName = isLend ? "make_lend_offer" : "make_borrow_offer";
            let calldata: any[] = [
                choosenAsset,
                (Number(inputAmount) * (10 ** 18)).toString(), '0',
            ];
            if (isLend) calldata.push('0', '0');
            calldata.push(
                (valueYield * VALUE_1PERCENT_APY).toString(), '0',
                Math.round(minimalDuration * 3600).toString(),
                Math.round(maximalDuration * 3600).toString()
            );
            
            await account.execute({ contractAddress, entrypoint: functionName, calldata });
            toast.success("Offer created successfully!");
            closeModal();
        } catch (err: any) {
            toast.error("An error occurred creating the offer.");
            console.error(err.message);
        } finally {
            setLoading(false);
        }
    }

    const isButtonDisabled = isNaN(Number(inputAmount)) || Number(inputAmount) <= 0 || !acceptDisclaimer || choosenAsset === "";//|| (isLend ? Number(inputAmount) > maxYouCanLend : Number(inputAmount) > maxYouCanBorrow) || (maximalDuration - minimalDuration < 24);

    return (
        <GenericModal isOpen={isOpen} onClose={closeModal} animate={animate} className="w-[90vw] md:w-[50rem] max-h-[90vh] p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold tracking-widest">Make an Offer</h1>
                <button onClick={closeModal} className="border border-green-500 w-8 h-8 flex items-center justify-center hover:bg-green-500 hover:text-black transition-all">X</button>
            </div>
            <div className="flex justify-center gap-4 mb-6">
                <button className={isLend ? "buttonselected" : ""} onClick={() => { setActiveTab("Make a Lend Offer"); setChoosenAsset(""); }}>Lend Offer</button>
                <button className={!isLend ? "buttonselected" : ""} onClick={() => { setActiveTab("Make a Borrow Offer"); setChoosenAsset(""); }}>Borrow Offer</button>
            </div>
            <div className="flex-grow overflow-y-auto pr-2 flex flex-col gap-4 text-lg">
                <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr] items-center gap-4">
                    <label>Max you can {isLend ? "lend" : "borrow"}:</label>
                    <span>{isLend ? maxYouCanLend.toFixed(18) : maxYouCanBorrow.toFixed(18)} {tokenUsed}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr] items-center gap-4">
                    <label htmlFor="amount">Amount ({tokenUsed}):</label>
                    <input id="amount" type="text" value={inputAmount} onChange={e => setInputAmount(e.target.value)} placeholder="0.0" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr] items-center gap-4">
                    <label htmlFor="yield">Yield ({valueYield.toFixed(1)}%)
                        {!isLend ? <><br/>Include a 1% apr fee</>: <></>}</label>
                    <input id="yield" type="range" min="1" max="50" step="0.5" value={valueYield} onChange={e => setValueYield(Number(e.target.value))} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr] items-center gap-4">
                    <label htmlFor="min-duration">Min Duration ({formatTime(minimalDuration)}):</label>
                    <input id="min-duration" type="range" min="1" max="1000" step="1" value={Math.log2(minimalDuration) * 100} onChange={(e) => setMinimalDuration(Math.pow(2, Number(e.target.value) / 100))} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr] items-center gap-4">
                    <label htmlFor="max-duration">Max Duration ({formatTime(maximalDuration)}):</label>
                    <input id="max-duration" type="range" min="470" max="1000" step="1" value={Math.log2(maximalDuration) * 100} onChange={(e) => setMaximalDuration(Math.pow(2, Number(e.target.value) / 100))} />
                </div>
                <hr className="border-green-500/30 my-2" />
                <ChooseAsset type={isLend ? "lend" : "borrow"} baseAsset={tokenUsed} address={account.address} above_choosenAsset={choosenAsset} set_above_choosenAsset={setChoosenAsset} />
                <hr className="border-green-500/30 my-2" />
                <SafetyBox valueamount={Number(inputAmount)} valueyield={valueYield * VALUE_1PERCENT_APY} minimal_duration={minimalDuration} maximal_duration={maximalDuration} type={isLend ? "lend" : "borrow"} takeormake={false} isvalid={acceptDisclaimer} set_isvalid={setAcceptDisclaimer} />
            </div>
            <button className="w-full mt-6 py-3 font-bold text-xl" onClick={handleExecute} disabled={isButtonDisabled || loading}>
                {loading ? "PROCESSING..." : `[ CREATE ${isLend ? "LEND" : "BORROW"} OFFER ]`}
            </button>
        </GenericModal>
    );
}

export default MakeOrderModal;