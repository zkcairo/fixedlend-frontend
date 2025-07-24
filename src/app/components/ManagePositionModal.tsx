"use client";
import GenericModal from "./GenericModal";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import MyAbi from "../abi/mycontract.abi.json";
import { CONTRACT_ADDRESS } from "@/app/utils/constant";
import { useContractRead } from "@starknet-react/core";
import AllOffers from "./DisplayAllOffers";
import { currentTime } from "@/app/utils/format";

type Props = { isOpen: boolean; onClose: () => void; account: any; tokenUsed: string; category: string; simplified: boolean; };

function ManagePositionModal({ isOpen, onClose, account, tokenUsed, category, simplified }: Props) {
    const [activeTab, setActiveTab] = useState("current loans");
    const [animate, setAnimate] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    const userAddress = account.address;
    const contractAddress = CONTRACT_ADDRESS;

    const { data: lending_offers, isLoading: lending_offer_loading } = useContractRead({ address: contractAddress, abi: MyAbi, functionName: "frontend_get_lend_offers_of_user", args: [category, userAddress], watch: true });
    const { data: borrowing_offers, isLoading: borrowing_offer_loading } = useContractRead({ address: contractAddress, abi: MyAbi, functionName: "frontend_get_borrow_offers_of_user", args: [category, userAddress], watch: true });
    const { data: matching_offers, isLoading: matching_offer_loading } = useContractRead({ address: contractAddress, abi: MyAbi, functionName: "frontend_get_all_matches_of_user", args: [category, userAddress], watch: true });
    const { data: collaterals, isLoading: collateral_loading } = useContractRead({ address: contractAddress, abi: MyAbi, functionName: "frontend_get_all_collaterals_of_user", args: [category, userAddress], watch: true });

    const offersData = { "lend offers": lending_offers, "borrow offers": borrowing_offers, "current loans": matching_offers, "collaterals": collaterals };
    const loadingState = { "lend offers": lending_offer_loading, "borrow offers": borrowing_offer_loading, "current loans": matching_offer_loading, "collaterals": collateral_loading };

    const offers = loadingState[activeTab as keyof typeof loadingState] ? [] : (activeTab !== "current loans" ? (offersData[activeTab as keyof typeof offersData] as any[])?.filter((offer: any) => offer.is_active) : offersData[activeTab as keyof typeof offersData]);

    const closeModal = (e?: React.MouseEvent<HTMLElement>) => { if (e) e.stopPropagation(); setAnimate(false); setTimeout(onClose, 400); };
    useEffect(() => { if (isOpen) setAnimate(true); }, [isOpen]);

    async function handleAction(id: any, liq: boolean) {
        setLoading(true);
        try {
            let functionName = "";
            let calldata: any[] = [];
            if (activeTab === "lend offers") { functionName = "disable_lend_offer"; calldata = [id.toString()]; }
            if (activeTab === "borrow offers") { functionName = "disable_borrow_offer"; calldata = [id.toString()]; }
            if (activeTab === "current loans") { functionName = id[0].toString(); calldata = [id[1].toString()]; }

            await account.execute({ contractAddress, entrypoint: functionName, calldata });
            toast.success("Action completed successfully!");
            closeModal();
        } catch (err: any) {
            toast.error("An error occurred.");
            console.error(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <GenericModal isOpen={isOpen} onClose={closeModal} animate={animate} className="w-[90vw] md:w-[50rem] max-h-[90vh] p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold tracking-widest">Manage Position</h1>
                <button onClick={closeModal} className="border border-green-500 w-8 h-8 flex items-center justify-center hover:bg-green-500 hover:text-black transition-all">X</button>
            </div>
            <div className="flex justify-center gap-4 mb-6">
                {(simplified ? ["lend offers", "current loans"] : ["lend offers", "borrow offers", "current loans"]).map((tab) => (
                    <button key={tab} className={`capitalize ${activeTab === tab ? "buttonselected" : ""}`} onClick={() => setActiveTab(tab)}>{tab}</button>
                ))}
            </div>
            <div className="flex-grow overflow-y-auto pr-2">
                {activeTab === "current loans" && <h2 className="text-center opacity-70 mb-4">Current Date: {currentTime()}</h2>}
                <AllOffers offers={offers as any[]} loading={loadingState[activeTab as keyof typeof loadingState]} type={activeTab.includes('loan') ? "loan" : (activeTab.includes('lend') ? 'lend' : 'borrow')} me={true} labelButton={"Disable"} action={handleAction} category={category} />
            </div>
        </GenericModal>
    );
}

export default ManagePositionModal;