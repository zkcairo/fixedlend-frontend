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
import { CONTRACT_ADDRESS, ETH_SEPOLIA, STRK_SEPOLIA, USDC_ADDRESS, USDC_SEPOLIA } from "@/app/utils/constant";
import { currentTime, formatCurrency } from "@/app/utils/format";
import { useContractRead } from "@starknet-react/core";
import {
  useAccount,
  useDisconnect,
  useStarkProfile,
} from "@starknet-react/core";
import AllOffers from "./DisplayAllOffers";
import { getDecimalsOfAsset, prettyNameFromAddress } from "../utils/erc20";

interface Errors {
  contractAddress?: boolean;
  functionName?: boolean;
  callData?: boolean;
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  account: any;
  tokenUsed: string;
  category: string;
  simplified: boolean;
};

function scaleapy(n: number) {
  const scale = 10000;
  return 100 - 100*Math.pow(((scale - n) / scale), 87600);
}

function MyContractExecutionModal({ isOpen, onClose, account, tokenUsed, category, simplified }: Props) {

  const userAddress = account.address;

  const [callData, setCallData] = useState<string>("");
  const [errors, setErrors] = useState<Errors>({
    contractAddress: false,
    functionName: false,
    callData: true,
  });
  const [activeTab, setActiveTab] = useState("current loans");
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const contractAddress = CONTRACT_ADDRESS;

  const { data: lending_offers, isLoading: lending_offer_loading } = useContractRead({
    address: contractAddress,
    abi: MyAbi,
    functionName: "frontend_get_lend_offers_of_user",
    args: [category, userAddress],
    watch: true,
  });

  const { data: borrowing_offers, isLoading: borrowing_offer_loading } = useContractRead({
    address: contractAddress,
    abi: MyAbi,
    functionName: "frontend_get_borrow_offers_of_user",
    args: [category, userAddress],
    watch: true,
  });

  const { data: matching_offers, isLoading: matching_offer_loading } = useContractRead({
    address: contractAddress,
    abi: MyAbi,
    functionName: "frontend_get_all_matches_of_user",
    args: [category, userAddress],
    watch: true,
  });

  const { data: collaterals, isLoading: collateral_loading } = useContractRead({
    address: contractAddress,
    abi: MyAbi,
    functionName: "frontend_get_all_collaterals_of_user",
    args: [category, userAddress],
    watch: true,
  });

  const offers_ = ((activeTab === "lend offers") ? lending_offers : 
                (activeTab === "borrow offers") ? borrowing_offers : 
                (activeTab === "current loans") ? matching_offers : collaterals);
  console.log(offers_);
  const loading_offers = (activeTab === "lend offers") ? lending_offer_loading :
                  (activeTab === "borrow offers") ? borrowing_offer_loading :
                  (activeTab === "current loans") ? matching_offer_loading : collateral_loading;
  const offers = loading_offers ? "..." : ((activeTab !== "current loans") ? (offers_ as any[]).filter((offer: any) => offer.is_active) : offers_);


  const closeModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnimate(false);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  function isValidStringArrayString(str: string): boolean {
    try {
      const arr = JSON.parse(str);
      if (!Array.isArray(arr)) return false;
      return arr.every((item: any) => typeof item === "string");
    } catch (error) {
      return false;
    }
  }

  const setCallDataValue = (value: string) => {
    setCallData(value);

    if (true) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        callData: false,
      }));
    } else
      setErrors((prevErrors) => ({
        ...prevErrors,
        callData: true,
      }));
  };

  useEffect(() => {
    if (isOpen) {
      setAnimate(true);
    } else {
      setAnimate(false);
    }
  }, [isOpen]);

  async function handleExecute(id: any) {
    // Todo - remove allowance?
    console.log("deploy");
    let success = false;
    try {
      setLoading(true);

      // Set function name depending on activeTab
      let functionName = "";
      if (activeTab === "lend offers") functionName = "disable_lend_offer";
      if (activeTab === "borrow offers") functionName = "disable_borrow_offer";
      if (activeTab === "current loans") functionName = "repay_offer";
      
      console.log(id);
      let call: any[] = [];

      const tocall = (functionName === "repay_offer") ? [id[0].toString()] : [id.toString()];
      call.push({
        contractAddress: contractAddress,
        calldata: tocall,
        entrypoint: functionName,
      });
      console.log("call", call);

      const parsedCallData = tocall;
      if (!parsedCallData.every((item: any) => typeof item === "string")) {
        throw new Error("Call data items must be strings");
      }

      const { transaction_hash: transferTxHash } = await account.execute(call, { maxFee: BigInt("0") });
      console.log("hash", transferTxHash);

      const transactionReponse = await account.waitForTransaction(
        transferTxHash
      );
      console.log("response", transactionReponse);

      toast.success("Your contract function was executed successfully!", {
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
      <div className="absolute right-5 top-">
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
      <h1 className="text-[24px] mb-2 font-semibold">All your offers/loans on {tokenUsed} market:</h1>
      <div className="flex justify-around mb-4 flex-wrap">
        {(simplified ? ["current loans"] : ["lend offers", "borrow offers", "current loans"]).map((tab) => (
          <button
          key={tab}
          className={`text-base px-4 py-2 ${activeTab === tab ? "buttonselected" : "bg-base"} rounded`}
          onClick={() => setActiveTab(tab)}
          >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {(activeTab === "lend offers" || activeTab === "borrow offers") && (
        <>
        <h1>
          <center>
          "Available amount" is how much one offer can pick from your wallet to make a loan.<br/>
          Please disable the offers you don't want to use anymore.<br/>
          </center>
        </h1>
        <hr/>
        </>
      )}

      {/* LEND */}
      {((activeTab === "lend offers")) && (
      <AllOffers
        offers={offers as any[]}
        loading={loading_offers}
        type="lend"
        me={true}
        labelButton={"Disable"}
        action={handleExecute}
        category={category}
        ></AllOffers>
      )}

      {/* BORROW */}
      {((activeTab === "borrow offers")) && (
          <AllOffers
          offers={offers as any[]}
          loading={loading_offers}
          type="borrow"
          me={true}
          labelButton={"Disable"}
          action={handleExecute}
          category={category}
          ></AllOffers>
      )}

      {/* LOANS */}
      {activeTab === "current loans" && (
        <>
        <h1><center>Current date: {currentTime()}</center></h1>
        <hr></hr>
          <AllOffers
          offers={offers as any[]}
          loading={loading_offers}
          type={"loan"}
          me={true}
          labelButton={""}
          action={handleExecute}
          category={category}
          ></AllOffers>
        </>
      )}

      {(offers as any) && (offers as any[]).length == 0 && (
        <div className="text-center text-lg">Currently, you do not have any {activeTab}.</div>
      )}


  {/* <button
    className="w-full mt-7 py-3 rounded font-medium flex items-center gap-x-2 justify-center disabled:cursor-not-allowed disabled:bg-slate-300"
      disabled={isNaN(Number(callData)) || Number(callData) <= 0}
  >
    Deploy transaction
    <Image
      src={loading ? spinner : rightArr}
      alt={loading ? "loading" : "right arrow"}
      height={16}
      width={16}
    />
  </button> */}
</GenericModal>
);
}

export default MyContractExecutionModal;
