"use client";

import GenericModal from "./GenericModal";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Call } from "starknet";
import spinner from "../../../public/assets/spinner.svg";
import { CONTRACT_ADDRESS } from '@/app/utils/constant';
import { prettyNameFromAddress } from "../utils/erc20";
import { getAllLend, getAllCollateral } from "@/app/utils/erc20";
import { getErc20Balance, getProtocolBalance } from "../utils/fetch";
import toast from "react-hot-toast";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  account: any;
  tokenUsed: string;
  category: string;
  alloffers: any;
};

function MyContractExecutionModal({ isOpen, onClose, account, tokenUsed, category, alloffers }: Props) {
  
  const [inputAmount, setInputAmount] = useState<string>("");
  const [activeTab, setActiveTab] = useState("Deposit");
  const [choosenAsset, setChoosenAsset] = useState("ETH");
  const [loading, setLoading] = useState<boolean>(false);
  const [animate, setAnimate] = useState(false);

  const contractAddress = CONTRACT_ADDRESS;

  const lendasset = getAllLend(tokenUsed)[0];
  const choosenAssetLend = lendasset[0].toString();
  const choosenDecimalsLend = lendasset[1];
  const tokenNameLend = prettyNameFromAddress(choosenAssetLend);

  const collateralAsset = getAllCollateral(tokenUsed)[0];
  const choosenAssetCollateral = collateralAsset[0].toString();
  const choosenDecimalsCollateral = collateralAsset[1];
  const tokenNameCollateral = prettyNameFromAddress(choosenAssetCollateral);

  // Balances
  const scale = 10000;
  const account_balance_eth = Math.round(scale * Number(getErc20Balance(choosenAssetLend, account.address)) / 10**18) / scale;
  const protocol_balance_eth = Math.round(scale * Number(getProtocolBalance(choosenAssetLend, account.address)) / 10**18) / scale;
  const account_balance_collateral = Math.round(scale * Number(getErc20Balance(choosenAssetCollateral, account.address)) / 10**18) / scale;
  const protocol_balance_collateral = Math.round(scale * Number(getProtocolBalance(choosenAssetCollateral, account.address)) / 10**18) / scale;

  useEffect(() => {
    if (isOpen) setAnimate(true);
  }, [isOpen]);

  const closeModal = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.stopPropagation();
    setAnimate(false);
    setTimeout(() => onClose(), 400);
  };

  async function handleExecute() {
    setLoading(true);
    let success = false;
    try {
      const functionName = activeTab === "Deposit" ? "deposit" : "withdraw";
      const asset = choosenAsset === "ETH" ? choosenAssetLend : choosenAssetCollateral;
      const decimals = choosenAsset === "ETH" ? choosenDecimalsLend : choosenDecimalsCollateral;
      const amount = BigInt(Math.floor(Number(inputAmount) * (10 ** Number(decimals))));

      let calls: Call[] = [];

      if (activeTab === "Deposit") {
        calls.push({
          contractAddress: asset,
          entrypoint: "approve",
          calldata: [contractAddress, amount.toString(), "0"],
        });
      }

      calls.push({
        contractAddress: contractAddress,
        entrypoint: functionName,
        calldata: [asset, amount.toString(), "0"],
      });

      const { transaction_hash } = await account.execute(calls);
      await account.waitForTransaction(transaction_hash);

      toast.success(`${activeTab} has been processed.`, { duration: 3000 });
      success = true;
    } catch (err: any) {
      toast.error("An error occurred! Please try again.", { duration: 3000 });
      console.error(err.message);
    } finally {
      setLoading(false);
      if (success) closeModal();
    }
  }

  const isButtonDisabled = isNaN(Number(inputAmount)) || Number(inputAmount) <= 0 || Number(inputAmount) > (activeTab === "Deposit" ? (choosenAsset === "ETH" ? account_balance_eth : account_balance_collateral) : (choosenAsset === "ETH" ? protocol_balance_eth : protocol_balance_collateral));

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={closeModal}
      animate={animate}
      className="w-[90vw] md:w-[50rem] max-h-[90vh] p-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold tracking-widest">{activeTab} {tokenUsed}</h1>
        <button onClick={closeModal} className="border border-green-500 w-8 h-8 flex items-center justify-center hover:bg-green-500 hover:text-black transition-all">
          X
        </button>
      </div>
      <div className="flex justify-center gap-4 mb-6">
        {["Deposit", "Withdraw"].map((tab) => (
          <button key={tab} className={activeTab === tab ? "buttonselected" : ""} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-y-4 text-lg">
        {/* Balances Panel */}
        <div className="border border-green-500/50 p-4 flex flex-col gap-2">
            <h3 className="text-xl tracking-wider mb-2">// BALANCES</h3>
            <div className="flex justify-between"><span>{tokenNameLend} in Wallet:</span><span>{account_balance_eth}</span></div>
            <div className="flex justify-between"><span>{tokenNameLend} in Protocol:</span><span>{protocol_balance_eth}</span></div>
            <div className="flex justify-between mt-2"><span>{tokenNameCollateral} in Wallet:</span><span>{account_balance_collateral}</span></div>
            <div className="flex justify-between"><span>{tokenNameCollateral} in Protocol:</span><span>{protocol_balance_collateral}</span></div>
        </div>

        {/* Action Panel */}
        <div className="border border-green-500/50 p-4 flex flex-col gap-4">
            <h3 className="text-xl tracking-wider">// ACTION</h3>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <span className="flex-shrink-0">Asset to {activeTab.toLowerCase()}:</span>
                <div className="flex gap-2">
                    <button className={`flex-grow ${choosenAsset === "ETH" ? "buttonselected" : ""}`} onClick={() => setChoosenAsset("ETH")}>{tokenNameLend}</button>
                    <button className={`flex-grow ${choosenAsset === "FETH" ? "buttonselected" : ""}`} onClick={() => setChoosenAsset("FETH")}>{tokenNameCollateral}</button>
                </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <label htmlFor="amount-input">Amount in {choosenAsset}:</label>
                <input
                    id="amount-input"
                    type="text"
                    className="w-full md:w-1/2"
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                    placeholder="0.0"
                />
            </div>
        </div>
      </div>

      <button
        className="w-full mt-6 py-3 font-medium flex items-center gap-x-3 justify-center text-xl tracking-widest"
        disabled={isButtonDisabled || loading}
        title={isButtonDisabled ? "Please enter a valid amount" : `Execute ${activeTab}`}
        onClick={handleExecute}
      >
        {loading ? "PROCESSING..." : `[ ${activeTab.toUpperCase()} ${choosenAsset} ]`}
        {loading && <Image src={spinner} alt="loading" height={20} width={20} className="animate-spin" />}
      </button>
    </GenericModal>
  );
}

export default MyContractExecutionModal;