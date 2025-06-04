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
import { CONTRACT_ADDRESS, ETH_CATEGORY, STRK_CATEGORY, USDC_CATEGORY, PLATFORM_FEE_APY, MIN_ETH_VALUE } from "@/app/utils/constant";
import DepositWithdrawModal from "../components/DepositWithdrawModal";


// Todo
// Dans bestrate quand on match pour trouver les meilleurs offres, faire l'inverse de compute_max_interest pour savoir combien on peut prendre sur l'offre
// Les borrowing amount affichés sur le front sont pas les bons, ça a été patch dans le code cairo mais pas deployé

// Todo, dans la liste des offers que je peux take, filtrer les offers trop basses typiquement à 0$


// https://cryptoyieldcurve.io

// Todo, quand on market lend l'allowance est mal faite
// Mais je peux faire increase_allowance, wtf

// Todo, virer dai0?




// Todo, dans les trucs que je peux mettre en collateral, mettre que ceux supporté par le protocol atm


// Voir pour l'allowance, qu'on utilise que allowance et pas increaseallowance - voir que c'est partout bien géré

// Dans la la liste des collaterals, le 6 de decimal est hardcodé - changer ça

// Todo organiser la liste des loans par date restant avant la liquidation?

// Dans le loan mettre dans le code cairo le token utilisé, et l'afficher dans l'ui
// De maniere generale, patch le code cairo, et faire un affichage different si on doit repay ou pas (si on est lender ou non)
// toRepayAmount dans l'appel de repay_debt de l'ui




// Regler ce probleme de amount available --- a priori ok - todo l'update ici dans le js
// Faire un loaned amount --- ??
// Trier, filtrer, etc... a chaque fois qu'on affiche un tableau --- ça verifier mais déjà fait a priori
// Avoir une fonction "can take order" savoir si un user a les fonds pour prendre tel order ou non - ou inclure ça direct dans la fonction qui renvoit tout --- ??
// Le match de offer: c'est le borrow qui choisit tous les termes tant qu'ils sont dans les termes du lender?
// Quand on choisit le collateral, laisser le choix entre un collateral deja posseder et un nouveau









export default function OrderBookPage() {

  const { account, status, isConnected } = useAccount();

  const [market, setMarket] = useState("ETH");
  const [duration, setDuration] = useState("1 Week");
  const [advancedSelection, setAdvancedSelection] = useState(false);
  const [minimalDuration, setMinimalDuration] = useState(7*24);
  const [maximalDuration, setMaximalDuration] = useState(7*24);

  const [isManagePositionModalOpen, setIsManagePositionModalOpen] = useState(false);
  const [isTakeOrderModalOpen, setIsTakeOrderModalOpen] = useState(false);
  const [isMakeOrderModalOpen, setIsMakeOrderModalOpen] = useState(false);
  const [bestRateModalOpen, setBestRateModalOpen] = useState(false);
  const [depositWithdrawModalOpen, setDepositWithdrawModalOpen] = useState(false);

  const currentCategory = ETH_CATEGORY; //market === "USDC" ? USDC_CATEGORY : market === "STRK" ? STRK_CATEGORY : ETH_CATEGORY;

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

  const orderBookData: {
    buyOrders: { volume: number; min_duration: number; max_duration: number; yield: number; }[];
    sellOrders: { volume: number; min_duration: number; max_duration: number; yield: number; }[];
  } = {
      buyOrders: sortByYield(all_offers[0], "borrow")
        .filter((offer) => offer.is_active)
        .filter((offer) => maximalDuration*3600 <= Number(offer.price.maximal_duration))
        .filter((offer) => minimalDuration*3600 >= Number(offer.price.minimal_duration))
        .filter((offer) => Number(offer.amount_available) > MIN_ETH_VALUE)
        .map((offer) => ({
          // TODO LE FACTORISER CE CALCUL
          volume: formatCurrency(Number(offer.amount_available)),
          min_duration: Number(offer.price.minimal_duration),
          max_duration: Number(offer.price.maximal_duration),
          yield: Number(offer.price.rate) / 10000 - 1,
        })),
      sellOrders: sortByYield(all_offers[1], "lend")
      .filter((offer) => offer.is_active)
      .filter((offer) => maximalDuration*3600 <= Number(offer.price.maximal_duration))
      .filter((offer) => minimalDuration*3600 >= Number(offer.price.minimal_duration))
      .filter((offer) => Number(offer.amount_available) > MIN_ETH_VALUE)
        .map((offer) => ({
          volume: formatCurrency(Number(offer.amount_available)),
          min_duration: Number(offer.price.minimal_duration),
          max_duration: Number(offer.price.maximal_duration),
          yield: Number(offer.price.rate) / 10000 + 1,
        })),
    };

  const disableButton = false; // Change this based on your logic

  const handleDurationChange = (newDuration: string) => {
    setDuration(newDuration);
    const int_duration = newDuration === "1 Day" ? 24 : newDuration === "1 Week" ? 7 * 24 : newDuration === "1 Month" ? 30 * 24 : 365 * 24;
    setMinimalDuration(int_duration);
    setMaximalDuration(int_duration);
  };

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
            simplified={false}
          />
        )}
        {isTakeOrderModalOpen && (
          <TakeOrderModal
            isOpen={isTakeOrderModalOpen}
            onClose={() => setIsTakeOrderModalOpen(false)}
            account={account}
            tokenUsed={market}
            category={currentCategory}
          />
        )}
        {isMakeOrderModalOpen && (
          <MakeOrderModal
            isOpen={isMakeOrderModalOpen}
            onClose={() => setIsMakeOrderModalOpen(false)}
            account={account}
            tokenUsed={market}
            category={currentCategory}
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
          <h1 className="text-4xl md:text-6xl font-bold mt-20 md:mt-10">Lending market:</h1>
          <h2 className="text-1xl md:text-2xl">
            {advancedSelection && (<>{market} market, loan between {formatTime(minimalDuration)} and {formatTime(maximalDuration)}</>)}
            {!advancedSelection && (<>{market} market, loan of {duration}</>)}
          </h2>

          <div className="flex gap-4 mt-4">
            <button disabled onClick={() => setMarket("USDC")} className={`py-2 px-4 ${market === "USDC" ? "buttonselected" : "py-2 px-4 disabled:bg-gray-300 disabled:text-white"}`}>
              USDC
            </button>
            <button onClick={() => setMarket("ETH")} className={`py-2 px-4 ${market === "ETH" ? "buttonselected" : "py-2 px-4 disabled:bg-gray-300 disabled:text-white"}`}>
              ETH
            </button>
            <button disabled onClick={() => setMarket("STRK")} className={`py-2 px-4 ${market === "STRK" ? "buttonselected" : "py-2 px-4 disabled:bg-gray-300 disabled:text-white"}`}>
              STRK
            </button>
          </div>

            {advancedSelection && (
                <div className="flex gap-4 mt-4">
                <input
                  type="range"
                  className="w-full"
                  min="1"
                  max="1100"
                  step="1"
                  value={Math.log2(minimalDuration) * 100}
                  onChange={(e) => setMinimalDuration(Math.pow(2, Number(e.target.value) / 100))}
                />
                <input
                  type="range"
                  className="w-full"
                  min="470"
                  max="1100"
                  step="1"
                  value={Math.log2(maximalDuration) * 100}
                  onChange={(e) => setMaximalDuration(Math.pow(2, Number(e.target.value) / 100))}
                />
                </div>
            )}


          <div className="flex gap-4 mt-4">
            {!advancedSelection && (<>
            <button onClick={() => {setAdvancedSelection(false); handleDurationChange("1 Day")}} className={`py-2 px-1 md:px-4 ${!advancedSelection && duration === "1 Day" ? "buttonselected" : ""}`}>
              1 Day
            </button>
            <button onClick={() => {setAdvancedSelection(false); handleDurationChange("1 Week")}} className={`py-2 px-1 md:px-4 ${!advancedSelection && duration === "1 Week" ? "buttonselected" : ""}`}>
              1 Week
            </button>
            <button onClick={() => {setAdvancedSelection(false); handleDurationChange("1 Month")}} className={`py-2 px-1 md:px-4 ${!advancedSelection && duration === "1 Month" ? "buttonselected" : ""}`}>
              1 Month
            </button>
            <button onClick={() => {setAdvancedSelection(false); handleDurationChange("1 Year")}} className={`py-2 px-1 md:px-4 ${!advancedSelection && duration === "1 Year" ? "buttonselected" : ""}`}>
              1 Year
            </button>
            </>)}
            <button onClick={() => {advancedSelection && handleDurationChange("1 Day"); setAdvancedSelection(!advancedSelection)}} className={`py-2 px-4 ${advancedSelection ? "buttonselected" : ""} hidden md:block`}>
              Advanced selection
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            <div className="w-full mt-2 mb-1">
              <div className="flex justify-between mb-4">
                <h4 className="text-lg text-center w-full border-b-2">Borrow Orders</h4>
                <h4 className="text-lg text-center w-full border-b-2">Lend Orders</h4>
              </div>
              <div className="grid grid-cols-2">
                <div className="border-r pr-4">
                  <div className="flex justify-between text-lg">
                    <span><u><b>Yield</b></u></span>
                    <span><u><b>Volume</b></u></span>
                  </div>
                  {orderBookData.buyOrders.slice(0, 4).map((order, index) => (
                    <div key={index} className="flex justify-between text-lg">
                      <span>{order.yield}%</span>
                      <span>{order.volume} {market}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-lg">
                    <span>...</span>
                    <span>...</span>
                  </div>
                </div>
                <div className="pl-4">
                  <div className="flex justify-between text-lg">
                    <span><u><b>Yield</b></u></span>
                    <span><u><b>Volume</b></u></span>
                  </div>
                  {orderBookData.sellOrders.slice(0, 4).map((order, index) => (
                    <div key={index} className="flex justify-between text-lg">
                      <span>{order.yield}%</span>
                      <span>{order.volume} {market}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-lg">
                    <span>...</span>
                    <span>...</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full h-56 md:h-64">
              <OrderBookGraph 
                buyOrders={orderBookData.buyOrders} 
                sellOrders={orderBookData.sellOrders} 
              />
            </div>
          </div>


          <div className="text-center mt-5">
            <button
              onClick={() => { setDepositWithdrawModalOpen(true); }}
              disabled={!isConnected}
              className="py-3 px-4 disabled:bg-gray-300 disabled:text-white"
            >
                {!isConnected ? "Connect your wallet to use the app" :
                (<>Deposit/Withdraw</>)}
            </button>
            <button
              onClick={() => { setIsManagePositionModalOpen(true); }}
              disabled={!isConnected}
              className="py-3 px-4 disabled:bg-gray-300 disabled:text-white"
            >
              {!isConnected ? "Connect your wallet to use the app" : "Manage Position"}
            </button>
          </div>
          <div className="text-center mt-5">
            <button
              onClick={() => { setBestRateModalOpen(true); }}
              disabled={!isConnected}
              className="py-3 px-4 disabled:bg-gray-300 disabled:text-white"
            >
                {!isConnected ? "Connect your wallet to use the app" :
                (<>Market Lend/Borrow</>)}
            </button>
          </div>
          <div className="text-center mb-10 md:mb-0">
            <button
              onClick={() => { setIsTakeOrderModalOpen(true); }}
              className="py-3 px-4 disabled:bg-gray-300 disabled:text-white"
            >
              Take Order
            </button>
            <button
              onClick={() => { setIsMakeOrderModalOpen(true); }}
              disabled={!isConnected}
              className="py-3 px-4 disabled:bg-gray-300 disabled:text-white"
            >
              {!isConnected ? "Connect your wallet to use the app" : "Make Order"}
            </button>
            <div className="block mt-5">
              <button className="py-3 px-4">
                <a href="https://docs.FixedLend.com/FixedLend/guide-to-use-the-app">Guide to use this app</a>
              </button>
            </div>
            <div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}