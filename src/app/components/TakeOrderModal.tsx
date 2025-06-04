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
import { CONTRACT_ADDRESS, ETH_CATEGORY, ETH_SEPOLIA, STRK_SEPOLIA, USDC_CATEGORY, USDC_SEPOLIA } from "@/app/utils/constant";
import { useContractRead } from "@starknet-react/core";
import AllOffers from "./DisplayAllOffers";
import TakeOrderModalFinal from "./TakeOrderModalFinal";

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
};

function MyContractExecutionModal({ isOpen, onClose, account, tokenUsed, category }: Props) {

  const [callData, setCallData] = useState<string>("");
  const [errors, setErrors] = useState<Errors>({
    contractAddress: false,
    functionName: false,
    callData: true,
  });
  const [activeTab, setActiveTab] = useState("All Lend Offers");
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [finalOpen, setFinalOpen] = useState(false);
  const [id, setId] = useState(999999999999);
  const [lend_or_borrow, setLend_or_borrow] = useState(1); // 0 for borrow, 1 for lend

  const setsetFinalOpen = (id: any) => {
    setFinalOpen(true);
    setId(id);
  }

  const contractAddress = CONTRACT_ADDRESS;

  //ETH
  const { data: users_data, isLoading: users_loading } = useContractRead({
    address: contractAddress,
    abi: MyAbi,
    functionName: "frontend_get_all_offers",
    args: [category],
    watch: true,
  });
  const all_offers = users_loading ? [[], []] : users_data;

  console.log("loz", all_offers, lend_or_borrow, id);
  console.log("loz", (all_offers as any)[lend_or_borrow].filter((offer: any) => offer.id.toString() === id.toString()));
  console.log("loz", id.toString());

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

  async function handleExecute() {
    console.log(account);
    console.log("deploy");
    let success = false;
    try {

      setLoading(true);

      // Set function name depending on activeTab
      let functionName = "";
      if (activeTab === "deposit") functionName = "deposit_token";
      if (activeTab === "withdraw") functionName = "withdraw_token";
      if (activeTab === "borrow") functionName = "borrow_token";
      if (activeTab === "repay") functionName = "repay_token";

      // const tocall = [tokenAddress, inputAmount, "0"];

      // let call = [{
      //   contractAddress: contractAddress,
      //   calldata: tocall,
      //   entrypoint: functionName,
      // }];
      // // If deposit, add an approve to it
      // if (activeTab === "deposit") {
      //   call = [
      //     {
      //       contractAddress: tokenAddress,
      //       calldata: [contractAddress, inputAmount, "0"],
      //       entrypoint: "approve"
      //     },
      //     call[0]];
      // }
      // console.log("call", call);

      // // Ensure callData is formatted as expected
      // const parsedCallData = tocall;
      // if (!parsedCallData.every((item: any) => typeof item === "string")) {
      //   throw new Error("Call data items must be strings");
      // }

      // // Sert à rien?
      // const maxFee = BigInt("0");
      // //const { suggestedMaxFee: maxFee } = await account.estimateInvokeFee(call);
      // console.log("maxFee", maxFee);

      // const { transaction_hash: transferTxHash } = await account.execute(call, { maxFee });
      // console.log("hash", transferTxHash);

      // const transactionReponse = await account.waitForTransaction(
      //   transferTxHash
      // );
      // console.log("response", transactionReponse);

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
    <>
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
      <h1 className="text-[24px] mb-2 font-semibold">Available offers to take, sorted by yield:</h1>
      <div className="flex justify-around mb-4 flex-wrap">
        {//"Immediate Lend", "Immediate Borrow", 
        ["All Lend Offers", "All Borrow Offers"].map((tab) => (
          <button
            key={tab}
            className={`text-base px-4 py-2 ${activeTab === tab ? "buttonselected" : "bg-base"} rounded disabled:bg-gray-300 disabled:text-white`}
            onClick={() => {setActiveTab(tab); setLend_or_borrow(tab === "All Borrow Offers" ? 0 : 1)}}
            // disabled={tab === "All Lend Offers"}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>





      {((activeTab === "Immediate Lend") || (activeTab === "Immediate Borrow")) && (
        <div>
  <div className="flex flex-col gap-y-5">
    <div className="grid grid-cols-2 gap-x-5">
      <div className="flex flex-col justify-center">
        <h2>Max you can lend</h2>
      </div>
      <div className="flex flex-col justify-center">
        <h2>todo$</h2>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-x-5">
      <div className="flex flex-col justify-center">
        <h2>Amount you want to lend in {tokenUsed}</h2>
      </div>
      <div className="flex flex-col justify-center">
        <input
          type="text"
          className="w-full rounded text-base outline-none border-[2px]"
          value={callData}
          onChange={(e) => setCallDataValue(e.target.value)}
        />
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-x-5">
      <div className="flex flex-col justify-center">
        <h2>Minimal duration of your loan: 10Hours</h2>
      </div>
      <div className="flex flex-col justify-center">
        <input
          type="range"
          className="w-full"
          min="0"
          max="100"
          step="1"
          // value={minimalDuration}
          // Todo devrait pas etre commente
          // onChange={(e) => setMinimalDuration(e.target.value)}
        />
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-x-5">
      <div className="flex flex-col justify-center">
        <h2>Maximal duration of your loan (in hours)</h2>
      </div>
      <div className="flex flex-col justify-center">
      <input
          type="range"
          className="w-full"
          min="0"
          max="100"
          step="1"
          //{maximalDuration}
          // Todo idem devrait pas etre commente
          // onChange={(e) => setMaximalDuration(Number(e.target.value))}
        />
      </div>
    </div>
  </div>

    <hr className="border-[1px] border-white my-5" />

    <h2>Available yield: todo% APR</h2>
  </div>

      )}



        {activeTab === "All Lend Offers" && (
          <AllOffers
            offers={(all_offers as any)[1].filter((offer: any) => offer.is_active)}
            loading={users_loading}
            type="lend"
            me={false}
            labelButton="Borrow"
            action={(id: Number) => {setsetFinalOpen(id)}}
            category={category}
          ></AllOffers>
        )}
        {activeTab === "All Borrow Offers" && (
          <AllOffers
            offers={(all_offers as any)[0].filter((offer: any) => offer.is_active)}
            loading={users_loading}
            type="borrow"
            me={false}
            labelButton="Lend"
            action={(id: Number) => {setsetFinalOpen(id)}}
            category={category}
          ></AllOffers>
        )}
    </GenericModal>

      {finalOpen &&
        <TakeOrderModalFinal
          isOpen={finalOpen}
          onClose={() => setFinalOpen(false)}
          account={account}
          offer={(all_offers as any)[lend_or_borrow].filter((offer: any) => offer.id.toString() === id.toString())[0]}
          isLend={activeTab === "All Lend Offers"}
          />
      }
  </>
  );
}

export default MyContractExecutionModal;
