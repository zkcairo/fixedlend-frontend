"use client";

import { useState } from "react";
import Header from "../components/Header";
import ManagePositionModal from "../components/ManagePositionModal";
import TakeOrderModal from "../components/TakeOrderModal";
import MakeOrderModal from "../components/MakeOrderModal";
import BestRateModal from "../components/BestRateModal";
import OrderBookGraph from "../components/OrderBookGraph";
import DepositWithdrawModal from "../components/DepositWithdrawModal";
import MatrixRain from "../components/MatrixRain";
import { useContractRead, useAccount } from "@starknet-react/core";
import MyAbi from "../abi/mycontract.abi.json";
import { sortByYield } from "@/app/utils/array";
import { formatCurrency, formatTime } from "@/app/utils/format";
import { CONTRACT_ADDRESS, ETH_CATEGORY, MIN_ETH_VALUE } from "@/app/utils/constant";

const contractAddress = CONTRACT_ADDRESS;

export default function OrderBookPage() {
  const { account, isConnected } = useAccount();

  const [market, setMarket] = useState("ETH");
  const [duration, setDuration] = useState("1 Week");
  const [advancedSelection, setAdvancedSelection] = useState(false);
  const [minimalDuration, setMinimalDuration] = useState(7 * 24);
  const [maximalDuration, setMaximalDuration] = useState(7 * 24);

  const [isManagePositionModalOpen, setIsManagePositionModalOpen] = useState(false);
  const [isTakeOrderModalOpen, setIsTakeOrderModalOpen] = useState(false);
  const [isMakeOrderModalOpen, setIsMakeOrderModalOpen] = useState(false);
  const [bestRateModalOpen, setBestRateModalOpen] = useState(false);
  const [depositWithdrawModalOpen, setDepositWithdrawModalOpen] = useState(false);

  const currentCategory = ETH_CATEGORY;

  const { data: users_data, isLoading: users_loading } = useContractRead({
    address: contractAddress, abi: MyAbi, functionName: "frontend_get_all_offers",
    args: [currentCategory], watch: true,
  });
  const all_offers = users_loading ? [Array(), Array()] : (users_data as any[]);

  const orderBookData = {
    buyOrders: sortByYield(all_offers[0], "borrow")
      .filter(o => o.is_active && maximalDuration * 3600 <= Number(o.price.maximal_duration) && minimalDuration * 3600 >= Number(o.price.minimal_duration) && Number(o.amount_available) > MIN_ETH_VALUE)
      .map(o => ({ volume: formatCurrency(Number(o.amount_available)), yield: Number(o.price.rate) / 10000 - 1 })),
    sellOrders: sortByYield(all_offers[1], "lend")
      .filter(o => o.is_active && maximalDuration * 3600 <= Number(o.price.maximal_duration) && minimalDuration * 3600 >= Number(o.price.minimal_duration) && Number(o.amount_available) > MIN_ETH_VALUE)
      .map(o => ({ volume: formatCurrency(Number(o.amount_available)), yield: Number(o.price.rate) / 10000 + 1 })),
  };

  const handleDurationChange = (newDuration: string) => {
    setDuration(newDuration);
    const int_duration = newDuration === "1 Day" ? 24 : newDuration === "1 Week" ? 7 * 24 : newDuration === "1 Month" ? 30 * 24 : 365 * 24;
    setMinimalDuration(int_duration);
    setMaximalDuration(int_duration);
  };

  return (
    <>
      <MatrixRain />
      <div className="content-wrapper">
        {isManagePositionModalOpen && <ManagePositionModal isOpen={isManagePositionModalOpen} onClose={() => setIsManagePositionModalOpen(false)} account={account} tokenUsed={market} category={currentCategory} simplified={false} />}
        {isTakeOrderModalOpen && <TakeOrderModal isOpen={isTakeOrderModalOpen} onClose={() => setIsTakeOrderModalOpen(false)} account={account} tokenUsed={market} category={currentCategory} />}
        {isMakeOrderModalOpen && <MakeOrderModal isOpen={isMakeOrderModalOpen} onClose={() => setIsMakeOrderModalOpen(false)} account={account} tokenUsed={market} category={currentCategory} />}
        {bestRateModalOpen && <BestRateModal disableBorrow={false} isOpen={bestRateModalOpen} onClose={() => setBestRateModalOpen(false)} account={account} tokenUsed={market} category={currentCategory} alloffers={all_offers} />}
        {depositWithdrawModalOpen && <DepositWithdrawModal disableBorrow={false} isOpen={depositWithdrawModalOpen} onClose={() => setDepositWithdrawModalOpen(false)} account={account} tokenUsed={market} category={currentCategory} alloffers={all_offers} />}
        
        <Header />
        
        <main className="container mx-auto py-10 px-4 flex flex-col items-center text-center mt-24 md:mt-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-wider">Lending Market</h1>
          <h2 className="text-xl md:text-2xl mt-2">
            {advancedSelection ? `${market} | Loan between ${formatTime(minimalDuration)} and ${formatTime(maximalDuration)}` : `${market} | Loan of ${duration}`}
          </h2>

          <div className="flex gap-2 md:gap-4 mt-6">
            <button disabled>USDC</button>
            <button onClick={() => setMarket("ETH")} className={market === "ETH" ? "buttonselected" : ""}>ETH</button>
            <button disabled>STRK</button>
          </div>

          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-4">
            {!advancedSelection && (
              <>
                <button onClick={() => handleDurationChange("1 Day")} className={duration === "1 Day" ? "buttonselected" : ""}>1 Day</button>
                <button onClick={() => handleDurationChange("1 Week")} className={duration === "1 Week" ? "buttonselected" : ""}>1 Week</button>
                <button onClick={() => handleDurationChange("1 Month")} className={duration === "1 Month" ? "buttonselected" : ""}>1 Month</button>
                <button onClick={() => handleDurationChange("1 Year")} className={duration === "1 Year" ? "buttonselected" : ""}>1 Year</button>
              </>
            )}
            <button onClick={() => { advancedSelection && handleDurationChange("1 Day"); setAdvancedSelection(!advancedSelection); }} className={advancedSelection ? "buttonselected" : ""}>
              {advancedSelection ? "Simple View" : "Advanced"}
            </button>
          </div>
          {advancedSelection && (
            <div className="flex gap-4 mt-4 w-full max-w-lg">
              <input type="range" min="1" max="1100" step="1" value={Math.log2(minimalDuration) * 100} onChange={(e) => setMinimalDuration(Math.pow(2, Number(e.target.value) / 100))} />
              <input type="range" min="470" max="1100" step="1" value={Math.log2(maximalDuration) * 100} onChange={(e) => setMaximalDuration(Math.pow(2, Number(e.target.value) / 100))} />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 w-full max-w-4xl">
            <div>
              <div className="grid grid-cols-2 text-lg">
                <h4 className="font-bold tracking-widest">Borrow Orders</h4>
                <h4 className="font-bold tracking-widest">Lend Orders</h4>
              </div>
              <div className="grid grid-cols-2 mt-2">
                <div className="pr-4">
                  <div className="flex justify-between font-bold"><span>Yield</span><span>Volume</span></div>
                  {orderBookData.buyOrders.slice(0, 4).map((order, i) => <div key={i} className="flex justify-between"><span>{order.yield}%</span><span>{order.volume} {market}</span></div>)}
                </div>
                <div className="pl-4">
                  <div className="flex justify-between font-bold"><span>Yield</span><span>Volume</span></div>
                  {orderBookData.sellOrders.slice(0, 4).map((order, i) => <div key={i} className="flex justify-between"><span>{order.yield}%</span><span>{order.volume} {market}</span></div>)}
                </div>
              </div>
            </div>
            <div className="w-full h-56"><OrderBookGraph buyOrders={orderBookData.buyOrders} sellOrders={orderBookData.sellOrders} /></div>
          </div>
          
          <div className="mt-8 flex flex-col gap-4 w-full max-w-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={() => setDepositWithdrawModalOpen(true)} disabled={!isConnected}>Deposit/Withdraw</button>
                <button onClick={() => setIsManagePositionModalOpen(true)} disabled={!isConnected}>Manage Position</button>
            </div>
            <button onClick={() => setBestRateModalOpen(true)} disabled={!isConnected}>Market Lend/Borrow</button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={() => setIsTakeOrderModalOpen(true)}>Take Order</button>
                <button onClick={() => setIsMakeOrderModalOpen(true)} disabled={!isConnected}>Make Order</button>
            </div>
             <button><a href="https://docs.FixedLend.com/FixedLend/guide-to-use-the-app" className="block w-full h-full py-2 px-4">Read The Guide</a></button>
          </div>
          {!isConnected && <p className="mt-4 text-red-500 animate-pulse">Connect your wallet to use the app</p>}
        </main>
      </div>
    </>
  );
}