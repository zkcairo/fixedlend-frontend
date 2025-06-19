"use client";
import GenericModal from "./GenericModal";
import { useEffect, useState } from "react";
import MyAbi from "../abi/mycontract.abi.json";
import { CONTRACT_ADDRESS } from "@/app/utils/constant";
import { useContractRead } from "@starknet-react/core";
import AllOffers from "./DisplayAllOffers";
import TakeOrderModalFinal from "./TakeOrderModalFinal";

type Props = { isOpen: boolean; onClose: () => void; account: any; tokenUsed: string; category: string; };

function TakeOrderModal({ isOpen, onClose, account, tokenUsed, category }: Props) {
    const [activeTab, setActiveTab] = useState("All Lend Offers");
    const [animate, setAnimate] = useState(false);
    const [finalOpen, setFinalOpen] = useState(false);
    const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);
    const isLendOfferTab = activeTab === "All Lend Offers";
    
    const contractAddress = CONTRACT_ADDRESS;

    const { data: all_offers, isLoading: users_loading } = useContractRead({ address: contractAddress, abi: MyAbi, functionName: "frontend_get_all_offers", args: [category], watch: true });

    const offersToShow = users_loading ? [] : (isLendOfferTab ? (all_offers as any[])[1] : (all_offers as any[])[0])?.filter((o: any) => o.is_active);
    const selectedOffer = selectedOfferId !== null ? (isLendOfferTab ? (all_offers as any[])[1] : (all_offers as any[])[0])?.find((o: any) => o.id.toString() === selectedOfferId.toString()) : null;

    const openFinalModal = (id: number) => {
        setSelectedOfferId(id);
        setFinalOpen(true);
    };

    const closeModal = (e?: React.MouseEvent<HTMLElement>) => { if (e) e.stopPropagation(); setAnimate(false); setTimeout(onClose, 400); };
    useEffect(() => { if (isOpen) setAnimate(true); }, [isOpen]);
    
    return (
        <>
            <GenericModal isOpen={isOpen} onClose={closeModal} animate={animate} className="w-[90vw] md:w-[50rem] max-h-[90vh] p-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold tracking-widest">Take an Offer</h1>
                    <button onClick={closeModal} className="border border-green-500 w-8 h-8 flex items-center justify-center hover:bg-green-500 hover:text-black transition-all">X</button>
                </div>
                <div className="flex justify-center gap-4 mb-6">
                    <button className={isLendOfferTab ? "buttonselected" : ""} onClick={() => setActiveTab("All Lend Offers")}>Lend Offers (Borrow from them)</button>
                    <button className={!isLendOfferTab ? "buttonselected" : ""} onClick={() => setActiveTab("All Borrow Offers")}>Borrow Offers (Lend to them)</button>
                </div>
                <div className="flex-grow overflow-y-auto pr-2">
                    <AllOffers offers={offersToShow || []} loading={users_loading} type={isLendOfferTab ? "lend" : "borrow"} me={false} labelButton={isLendOfferTab ? "Borrow" : "Lend"} action={openFinalModal} category={category} />
                </div>
            </GenericModal>

            {finalOpen && selectedOffer && (
                <TakeOrderModalFinal isOpen={finalOpen} onClose={() => setFinalOpen(false)} account={account} offer={selectedOffer} isLend={isLendOfferTab} />
            )}
        </>
    );
}

export default TakeOrderModal;