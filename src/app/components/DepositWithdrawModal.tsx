"use client";
import GenericModal from "./GenericModal";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Call } from "starknet";
import spinner from "../../../public/assets/spinner.svg";
import rightArr from "../../../public/assets/right-arr.svg";
import toast from "react-hot-toast";
import Erc20Abi from "../abi/token.abi.json";
import MyAbi from "../abi/mycontract.abi.json";
import { USDC_ADDRESS, USDT_ADDRESS, DAI_ADDRESS, DAIV0_ADDRESS, VALUE_1PERCENT_APY, PLATFORM_FEE_APY, CONTRACT_ADDRESS } from '@/app/utils/constant';
import { SCALE_APY } from '@/app/utils/constant';
import { formatCurrency, formatTime, formatYield } from "@/app/utils/format";
import { useContractRead } from "@starknet-react/core";
import { getAllLend, getAllCollateral, getAllBalance, normalizeAmountLend, normalizeAmountBorrow, prettyNameFromAddress, getDecimalsOfAsset, getBalance } from "@/app/utils/erc20";
import ChooseAsset from "./ChooseAsset";
import SafetyBox from "./SafeParametersJustLendBorrow";
import { matchBorrow, matchLend } from "../utils/matchMaking";
import { getErc20Balance, getProtocolBalance } from "../utils/fetch";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  account: any;
  tokenUsed: string;
  category: string;
  alloffers: any;
};

function MyContractExecutionModal({ isOpen, onClose, account, tokenUsed, category, alloffers }: Props) {
  
  const [valueYield, setValueYield] = useState<number>(10);
  const [minimalDuration, setMinimalDuration] = useState<number>(1);
  const [maximalDuration, setMaximalDuration] = useState<number>(100);
  const [inputAmount, setInputAmount] = useState<string>("");
  const [activeTab, setActiveTab] = useState("Deposit");
  
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const contractAddress = CONTRACT_ADDRESS;

  const lendasset = getAllLend(tokenUsed)[0];
  const choosenAssetLend = lendasset[0].toString();
  const choosenDecimalsLend = lendasset[1];
  const tokenNameLend = prettyNameFromAddress(choosenAssetLend);

  const borrowasset = getAllCollateral(tokenUsed)[0];
  const choosenAssetBorrow = borrowasset[0].toString();
  const choosenDecimalsBorrow = borrowasset[1];
  const tokenNameCollateral = prettyNameFromAddress(choosenAssetBorrow);

  const [choosenAsset, setChoosenAsset] = useState("ETH");

  const scale = 10000;
  const account_balance_eth = Math.round(scale * Number(getErc20Balance(choosenAssetLend, account.address)) / 10**18) / scale;
  console.log("Account balance", account_balance_eth);

  const protocol_balance_eth = Math.round(scale * Number(getProtocolBalance(choosenAssetLend, account.address)) / 10**18) / scale;
  console.log("Protocol balance", protocol_balance_eth);

  const account_balance_feth = Math.round(scale * Number(getErc20Balance(choosenAssetBorrow, account.address)) / 10**18) / scale;
  console.log("Account balance", account_balance_feth);

  const protocol_balance_feth = Math.round(scale * Number(getProtocolBalance(choosenAssetBorrow, account.address)) / 10**18) / scale;
  console.log("Protocol balance", protocol_balance_feth);

  const closeModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnimate(false);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  useEffect(() => {
    if (isOpen) {
      setAnimate(true);
    } else {
      setAnimate(false);
    }
  }, [isOpen]);

  async function handleExecute() {
    console.log("handle execute");
    let success = false;
    try {
      setLoading(true);

      let functionName = "";
      functionName = activeTab === "Deposit" ? "deposit" : "withdraw";

      let call = [];
      let amount = Number(inputAmount)*(10**Number(choosenDecimalsLend));
      let asset = choosenAsset === "ETH" ? choosenAssetLend : choosenAssetBorrow;
      let decimals = choosenAsset === "ETH" ? choosenDecimalsLend : choosenDecimalsBorrow;
      if (activeTab === "Deposit") {
        call.push({
          contractAddress: asset,
          calldata: [contractAddress, amount, 0].map((value) => String(value)),
          entrypoint: "approve"
        })
    }
    call.push({
        contractAddress: contractAddress,
        calldata: [asset, normalizeAmountLend(amount, decimals), 0].map((value) => String(value)),
        entrypoint: functionName
    });
      console.log("call", call);

      // Sert à rien?
      const maxFee = BigInt("0");
      //const { suggestedMaxFee: maxFee } = await account.estimateInvokeFee(call);
      console.log("maxFee", maxFee);

      const { transaction_hash: transferTxHash } = await account.execute(call, { maxFee });
      console.log("hash", transferTxHash);

      const transactionReponse = await account.waitForTransaction(
        transferTxHash
      );
      console.log("response", transactionReponse);

      toast.success(activeTab + " has been processed placed", {
        duration: 2000,
      });
      success = true;
    } catch (err: any) {
      toast.error("An error occurred! Please try again.", { duration: 2000 });
      console.log(err.message);
    } finally {
      setLoading(false);
      if (success)
        setTimeout(() => {
          onClose();
        }, 400);
    }
  }

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={closeModal}
      animate={animate}
      className="w-[90vw] mx-auto md:h-fit md:w-[45rem] text-white py-4 px-5 relative bg-black max-h-[90vh]"
    >
      <div className="absolute right-5 top-4">
        <button
          onClick={(e) => {
            closeModal(e);
            e.stopPropagation();
            }}
            className="w-8 h-8 grid place-content-center rounded-full bg-outline-grey"
          >
            <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            >
            <path
              fill="currentColor"
              d="m6.4 18.308l-.708-.708l5.6-5.6l-5.6-5.6l.708-.708l5.6 5.6l5.6-5.6l.708.708l-5.6 5.6z"
            />
            </svg>
          </button>
          </div>
            <h1 className="text-[24px] mb-2 font-semibold">{activeTab} {tokenUsed}:</h1>
            <div className="flex justify-around mb-4 flex-wrap">
            {["Deposit", "Withdraw"].map((tab) => (
            <button
            key={tab}
            className={`text-base px-4 py-2 ${activeTab === tab ? "buttonselected" : "bg-base"} rounded disabled:bg-gray-300 disabled:text-white`}
            onClick={() => {setActiveTab(tab)}}
            disabled={tab === "Just borrow"}
            >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
          </div>

        <div className="scroll">
        <div className="flex flex-col gap-y-5">
        <div className="grid grid-cols-2 gap-x-5">
          <div className="flex flex-col justify-center">
          <h2>Amount of {tokenNameLend} in your wallet</h2>
          </div>
          <div className="flex flex-col justify-center">
          <h2>{account_balance_eth} {tokenNameLend}</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-5">
          <div className="flex flex-col justify-center">
          <h2>Amount of {tokenNameLend} in the protocol</h2>
          </div>
          <div className="flex flex-col justify-center">
          <h2>{protocol_balance_eth} {tokenNameLend}</h2>
          </div>
        </div>

        <hr className="border-[1px] border-white" />

        <div className="grid grid-cols-2 gap-x-5">
          <div className="flex flex-col justify-center">
          <h2>Amount of {tokenNameCollateral} in your wallet</h2>
          </div>
          <div className="flex flex-col justify-center">
          <h2>{account_balance_feth} {tokenNameCollateral}</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-5">
          <div className="flex flex-col justify-center">
          <h2>Amount of {tokenNameCollateral} in the protocol</h2>
          </div>
          <div className="flex flex-col justify-center">
          <h2>{protocol_balance_feth} {tokenNameCollateral}</h2>
          </div>
        </div>

        <hr className="border-[1px] border-white" />


        <div className="grid grid-cols-2 gap-x-5">
          <div className="flex flex-col justify-center">
          <h2>Asset to {activeTab.toLowerCase()}</h2>
          </div>
          <div className="grid grid-cols-2 gap-x-5">
            <div className="flex flex-col justify-center">
              <button
                className={`text-base px-4 py-2 ${choosenAsset === "ETH" ? "buttonselected" : "bg-base"} rounded`}
                onClick={() => setChoosenAsset("ETH")}
              >{tokenNameLend}</button>
            </div>
            <div className="flex flex-col justify-center">
              <button
                className={`text-base px-4 py-2 ${choosenAsset === "FETH" ? "buttonselected" : "bg-base"} rounded`}
                onClick={() => setChoosenAsset("FETH")}
              >{tokenNameCollateral}</button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-5">
          <div className="flex flex-col justify-center">
          <h2>Amount you want to {activeTab.toLocaleLowerCase()} in {choosenAsset}</h2>
          </div>
          <div className="flex flex-col justify-center">
          <input
            type="text"
            className="w-full rounded text-base outline-none border-[2px]"
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            // onChange={(e) => {if (Number(e.target.value) > 0 || e.target.value === "")
            //   {setInputAmount(Math.min(Number(e.target.value), activeTab === "Deposit" ? Math.floor(account_balance_eth) : Math.floor(protocol_balance_eth)).toString())}
            // }}
          />
          </div>
        </div>

        </div>

        </div>

        <button
        className="w-full mt-7 py-3 rounded font-medium flex items-center gap-x-2 justify-center disabled:cursor-not-allowed disabled:bg-slate-300"
        disabled={
            isNaN(Number(inputAmount)) || Number(inputAmount) <= 0 || Number(inputAmount) > (activeTab === "Deposit" ? (choosenAsset === "ETH" ? account_balance_eth : account_balance_feth) : (choosenAsset === "ETH" ? protocol_balance_eth : protocol_balance_feth))
        }
        title={
            isNaN(Number(inputAmount)) || Number(inputAmount) <= 0 || Number(inputAmount) > (activeTab === "Deposit" ? (choosenAsset === "ETH" ? account_balance_eth : account_balance_feth) : (choosenAsset === "ETH" ? protocol_balance_eth : protocol_balance_feth))
            ? "Please enter a valid amount"
            : activeTab + " " + choosenAsset
        }
        onClick={async (e) => {
            e.preventDefault();
            await handleExecute();
        }}
        >
        {activeTab} {choosenAsset}
        <Image
          src={loading ? spinner : rightArr}
          alt={loading ? "loading" : "right arrow"}
          height={16}
          width={16}
        />
        </button>

    </GenericModal>
  );
}

export default MyContractExecutionModal;
