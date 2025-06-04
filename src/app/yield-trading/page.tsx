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

export default function OrderBookPage() {

  const { account, status, isConnected } = useAccount();

  const [market, setMarket] = useState("USDC");

  const [isManagePositionModalOpen, setIsManagePositionModalOpen] = useState(false);
  const [bestRateModalOpen, setBestRateModalOpen] = useState(false);

  const currentCategory = market === "USDC" ? USDC_CATEGORY : ETH_CATEGORY;

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
  

  const disableButton = false; // Change this based on your logic

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
        <Header />
        <div className="flex items-center justify-center flex-col">
          <h1 className="text-4xl md:text-6xl font-bold mt-24 md:mt-16">FixedLend</h1>
          <h2 className="text-1xl md:text-2xl">Welcome to the $STRK Yield Trading Hub:</h2>

          <div className="flex grid-cols-1 md:grid-cols-1 gap-4 mt-5">
            <div className="mt-10 w-full items-center">
              <p>Dear user</p>
              <p>(Thanks for trying my app)</p>
              <br/>
              <p>Either fix your yield right now on your $STRK to earn (todo) APR.</p>
              <br/>
              <p>Or, bet that the real yield is above (todo) APR.</p>
              <p>(In that case a few % of difference can turn into massive profits)</p>
              <p>(If the real yield is 10%, and the borrow yield is 5%, you'll earn 40% APR !)</p>
              <p>(<a href="#">check the math here</a>)</p>
              <br/>
              <p>If your wanted yield is within the spread, please be a market maker.</p>
              <p>(It's quite likely you don't want to be a market maker)</p>
            </div>
          </div>


          <div className="block mt-16">
          <button
              onClick={() => { setBestRateModalOpen(true); }}
              disabled={!isConnected}
              className="py-3 px-4 disabled:bg-gray-300 disabled:text-white"
            >
                {!isConnected ? "Connect your wallet to use the app" :
                (<>Fix your yield</>)}
            </button>
            <button
              onClick={() => { setBestRateModalOpen(true); }}
              disabled={!isConnected}
              className="py-3 px-4 disabled:bg-gray-300 disabled:text-white"
            >
                {!isConnected ? "Connect your wallet to use the app" :
                (<>Bet that yield will increase</>)}
            </button>
            <button
              onClick={() => { setBestRateModalOpen(true); }}
              disabled={!isConnected}
              className="py-3 px-4 disabled:bg-gray-300 disabled:text-white"
            >
                {!isConnected ? "Connect your wallet to use the app" :
                (<>I'm a market maker, bitch</>)}
            </button>
          </div>
          <div className="block">
            <button
              onClick={() => { setIsManagePositionModalOpen(true); }}
              disabled={!isConnected}
              className="py-3 px-4 disabled:bg-gray-300 disabled:text-white"
            >
              {!isConnected ? "Connect your wallet to use the app" : "Your loans"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}