"use client";

import { useState } from "react";
import Header from "../components/Header";
import Bottom from "../components/Bottom";
import ManagePositionModal from "../components/ManagePositionModal";
import TakeOrderModal from "../components/TakeOrderModal";
import MakeOrderModal from "../components/MakeOrderModal";
import BestRateModal from "../components/BestRateModal";
import OrderBookGraph from "../components/OrderBookGraph";
import { useContractRead } from "@starknet-react/core";
import MyAbi from "../abi/mycontract.abi.json";
import { sortByYield } from "@/app/utils/array";
import { formatCurrency, formatTime } from "@/app/utils/format";
const contractAddress = CONTRACT_ADDRESS;
import {
  useAccount,
  useDisconnect,
  useStarkProfile,
} from "@starknet-react/core";
import { CONTRACT_ADDRESS, ETH_CATEGORY, PLATFORM_FEE_APY, USDC_CATEGORY } from "@/app/utils/constant";
import DepositWithdrawModal from "../components/DepositWithdrawModal";

export default function OrderBookPage() {

  const { account, status, isConnected } = useAccount();

  const [market, setMarket] = useState("ETH");

  const [bestRateModalOpen, setBestRateModalOpen] = useState(false);
  const [isManagePositionModalOpen, setIsManagePositionModalOpen] = useState(false);
  const [depositWithdrawModalOpen, setDepositWithdrawModalOpen] = useState(false);

  const currentCategory = ETH_CATEGORY; //market === "USDC" ? USDC_CATEGORY : ETH_CATEGORY;

  //ETH
  const { data: users_data, isLoading: users_loading } = useContractRead({
    address: contractAddress,
    abi: MyAbi,
    functionName: "frontend_get_all_offers",
    args: [currentCategory],
    watch: true,
  });
  const all_offers = users_loading ? [Array(), Array()] : users_data as any[];
  console.log("all offers", all_offers);

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col dark:text-white text-black">
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
          />
        )}
        <Header />
        <div className="flex items-center justify-center flex-col">
          <h1 className="text-4xl md:text-6xl font-bold mt-24 md:mt-16">FixedLend</h1>
          <h2 className="text-1xl md:text-2xl">Your Peer-to-Peer Lending Hub:</h2>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-5">
            <div className="w-full mt-10">
            <p>Sophisticated users have placed borrowing and lending offers on this marketplace.</p>
            <p>You can now take any of them, on your terms, to get an attractive yield.</p>
            <br />
            <p>First, deposit some assets, then lend/borrow with it. </p>
            <p>Enjoy competitive rates, customizable loan durations, and attractive yields.</p>
            </div>
          </div>


          <div className="block mt-10">
            <button
              onClick={() => { setDepositWithdrawModalOpen(true); }}
              disabled={!isConnected}
              className="py-3 px-4 disabled:bg-gray-300 disabled:text-white"
            >
              {!isConnected ? "Connect your wallet to use the app" : "Deposit/Withdraw"}
            </button>
          </div>

          <div className="block mt-4">
            <button
              onClick={() => { setBestRateModalOpen(true); }}
              disabled={!isConnected}
              className="py-3 px-4 disabled:bg-gray-300 disabled:text-white"
            >
              {!isConnected ? "Connect your wallet to use the app" :
              (<>Lend/Borrow Eth</>)}
            </button>
            <button
              onClick={() => { setIsManagePositionModalOpen(true); }}
              disabled={!isConnected}
              className="py-3 px-4 disabled:bg-gray-300 disabled:text-white"
            >
              {!isConnected ? "Connect your wallet to use the app" : "Your Eth loans"}
            </button>
          </div>

          <div className="block mt-5">
            <button className="py-3 px-4">
              <a href="/app">Go to the market-maker interface</a>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}