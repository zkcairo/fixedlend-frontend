"use client";

import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import ManagePositionModal from "../components/ManagePositionModal";
import BestRateModal from "../components/BestRateModal";
import DepositWithdrawModal from "../components/DepositWithdrawModal";
import { useContractRead, useAccount } from "@starknet-react/core";
import MyAbi from "../abi/mycontract.abi.json";
import { CONTRACT_ADDRESS, ETH_CATEGORY } from "@/app/utils/constant";
import MatrixRain from "../components/MatrixRain";
import RecurringLendModal from "../components/RecurringLend";

export default function OrderBookPage() {
  const { account, isConnected } = useAccount();

  const [market, setMarket] = useState("ETH");
  const [bestRateModalOpen, setBestRateModalOpen] = useState(false);
  const [recurringModalOpen, setRecurringModalOpen] = useState(false);
  const [isManagePositionModalOpen, setIsManagePositionModalOpen] = useState(false);
  const [depositWithdrawModalOpen, setDepositWithdrawModalOpen] = useState(false);

  const currentCategory = ETH_CATEGORY;

  const { data: users_data, isLoading: users_loading } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: MyAbi,
    functionName: "frontend_get_all_offers",
    args: [currentCategory],
    watch: true,
  });
  const all_offers = users_loading ? [Array(), Array()] : (users_data as any[]);

  return (
    <>
      <MatrixRain />
      <div className="content-wrapper">
        {isManagePositionModalOpen && (
          <ManagePositionModal
            isOpen={isManagePositionModalOpen}
            onClose={() => setIsManagePositionModalOpen(false)}
            account={account}
            tokenUsed={market}
            category={currentCategory}
            simplified={true}
          />
        )}
        {bestRateModalOpen && (
          <BestRateModal
            isOpen={bestRateModalOpen}
            onClose={() => setBestRateModalOpen(false)}
            account={account}
            tokenUsed={market}
            category={currentCategory}
            alloffers={all_offers}
            disableBorrow={true}
          />
        )}
        {recurringModalOpen && (
          <RecurringLendModal
            isOpen={recurringModalOpen}
            onClose={() => setRecurringModalOpen(false)}
            account={account}
            tokenUsed={market}
            category={currentCategory}
            alloffers={all_offers}
            disableBorrow={true}
          />
        )}
        {depositWithdrawModalOpen && (
          <DepositWithdrawModal
            isOpen={depositWithdrawModalOpen}
            onClose={() => setDepositWithdrawModalOpen(false)}
            account={account}
            tokenUsed={market}
            category={currentCategory}
            alloffers={all_offers}
            disableBorrow={true}
          />
        )}
        
        <Header />

        <main className="container mx-auto py-10 px-4 flex flex-col items-center text-center mt-24 md:mt-12">
            <h1 className="text-5xl md:text-7xl font-bold tracking-widest">FixedLend</h1>
            <h2 className="text-xl md:text-2xl mt-2">(Earn Page)</h2>

            <div className="w-full max-w-xl mt-12 text-left text-lg leading-relaxed">
              <p>{">"} First, deposit some non-yield assets like ETH.</p>
              <p>{">"} Then lend it, either for a single loan or a recurring loan.</p>
              <p>{">"} (Right now, only ETH is supported)</p>
              {/* <p>{">"} To do so, click "Lend" and enter your duration, the best available APY is displayed to you,
                accept it or not.</p> */}
              <br/>
              {/* <p>{">"} The APY you get is not what you wanted?</p> */}
              <p>{">"} Feeling like a pro trader? Go to the market-maker interface.</p>
            </div>

            <div className="mt-12 w-full max-w-sm flex flex-col gap-4">
              <button
                onClick={() => setDepositWithdrawModalOpen(true)}
                disabled={!isConnected}
                className="w-full"
              >
                Deposit/Withdraw
              </button>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setBestRateModalOpen(true)}
                  disabled={!isConnected}
                >
                  Single Lend
                </button>
                <button
                  onClick={() => setRecurringModalOpen(true)}
                  disabled={!isConnected}
                >
                  Recurring Lend
                </button>
              </div>
              <button
                onClick={() => setIsManagePositionModalOpen(true)}
                disabled={!isConnected}
              >
                Your Positions
              </button>

              <button className="w-full mt-4">
                <a href="/app" className="block w-full h-full">Go to the market-maker interface</a>
              </button>
            </div>
            {!isConnected && <p className="mt-4 text-red-500 animate-pulse">Connect your wallet to use the app</p>}
        </main>
      </div>
    </>
  );
}