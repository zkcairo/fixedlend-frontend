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
import { ETH_ADDRESS, FETH_ADDRESS, USDC_ADDRESS, USDT_ADDRESS, DAI_ADDRESS, DAIV0_ADDRESS, VALUE_1PERCENT_APY, PLATFORM_FEE_APY, CONTRACT_ADDRESS } from '@/app/utils/constant';
import { SCALE_APY } from '@/app/utils/constant';
import { formatCurrency, formatTime, formatYield } from "@/app/utils/format";
import { useContractRead } from "@starknet-react/core";
import { getAllLend, getAllCollateral, getAllBalance, normalizeAmountLend, normalizeAmountBorrow, prettyNameFromAddress, getDecimalsOfAsset } from "@/app/utils/erc20";
import ChooseAsset from "./ChooseAsset";
import SafetyBox from "./SafeParametersJustLendBorrow";
import { matchBorrow, matchLend } from "../utils/matchMaking";
import { getProtocolBalance } from "../utils/fetch";

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
  const [activeTab, setActiveTab] = useState("Just lend");

  const protocol_balance_eth = formatCurrency(Number(getProtocolBalance(ETH_ADDRESS, account.address)));
  console.log("Protocol balance", protocol_balance_eth);

  const protocol_balance_feth = formatCurrency(Number(getProtocolBalance(FETH_ADDRESS, account.address)));
  console.log("Protocol balance", protocol_balance_feth);

  const maxYouCanLend = protocol_balance_eth;
  const maxYouCanBorrow = 0.47*protocol_balance_feth;

  const [choosenAsset, setChoosenAsset] = useState("");
  const choosenDecimals = getDecimalsOfAsset(prettyNameFromAddress(choosenAsset));

  const [acceptDisclaimer, setAcceptDisclaimer] = useState(true);
  
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const contractAddress = CONTRACT_ADDRESS;

  const { data: mylendingid_data, isLoading: mylendingid_loading } = useContractRead({
    address: contractAddress,
    abi: MyAbi,
    functionName: "frontend_all_lend_offers_len",
    args: [],
    watch: true,
  });
  const mylendingid = mylendingid_loading ? "..." : mylendingid_data;

  const { data: myborrowingid_data, isLoading: myborrowingid_loading } = useContractRead({
    address: contractAddress,
    abi: MyAbi,
    functionName: "frontend_all_borrow_offers_len",
    args: [],
    watch: true,
  });
  const myborrowingid = myborrowingid_loading ? "..." : myborrowingid_data;

  const myid = activeTab === "Just lend" ? mylendingid : myborrowingid;


  const chooseOffer = {
    amount: Number(inputAmount) * 10**18,
    price: {
      rate: valueYield * VALUE_1PERCENT_APY,
      minimal_duration: Math.round(minimalDuration * 3600) + 1,
      maximal_duration: Math.round(maximalDuration * 3600) + 1
    }
  }
  const [list_of_offers_, obtainedYield] = activeTab === "Just lend" ? matchLend(chooseOffer, alloffers) : matchBorrow(chooseOffer, alloffers);
  const list_of_offers = list_of_offers_ as any[];
  console.log("list_of_offers", list_of_offers);
  console.log("obtainedYield", obtainedYield);

  // let maxYouCanLend = 0;
  // let maxYouCanBorrow = 0;
  // let allLend: any[] = [];
  // let allCollaterals: any[] = [];

  // console.log("asset used", tokenUsed);

  // if (activeTab === "Just lend") {
  //   let allAssets: any[] = getAllLend(tokenUsed);
  //   const allBalances = getAllBalance(allAssets.map((value) => value[0]), account.address);
  //   allLend = allAssets;
  //   const allValue = allBalances.map((value, index) => normalizeAmountLend(value, allAssets[index][1]));
  //   maxYouCanLend = Math.round(100 * allValue.reduce((sum, balance) => sum + balance, 0) / 10**18) / 100;
  //   if (choosenAsset === USDC_ADDRESS) {
  //     maxYouCanLend = Math.round(100 * allValue[0] / 10**18) / 100;
  //   } else if (choosenAsset === USDT_ADDRESS) {
  //     maxYouCanLend = Math.round(100 * allValue[1] / 10**18) / 100;
  //   } else if (choosenAsset === DAI_ADDRESS) {
  //     maxYouCanLend = Math.round(100 * allValue[2] / 10**18) / 100;
  //   } else if (choosenAsset === DAIV0_ADDRESS) {
  //     maxYouCanLend = Math.round(100 * allValue[3] / 10**18) / 100;
  //   }
  // } else {
  //   const allAssets: any[] = getAllCollateral(tokenUsed);
  //   const allBalances = getAllBalance(allAssets.map((value) => value[0]), account.address);
  //   allCollaterals = allAssets.filter((value, idx) => allBalances[idx] > 0);
  //   const allValue = allBalances.map((value, index) => normalizeAmountBorrow(value, allAssets[index][1]));
  //   maxYouCanBorrow = Math.round(100 * allValue.reduce((sum, balance) => sum + balance, 0) / 10**18) / 100;
  //   if (choosenAsset === NIMBORA_npaUSDT_ADDRESS) {
  //     maxYouCanBorrow = Math.round(100 * allValue[0] / 10**18) / 100;
  //   } else if (choosenAsset === NIMBORA_nsDAI_ADDRESS) {
  //     maxYouCanBorrow = Math.round(100 * allValue[1] / 10**18) / 100;
  //   } else if (choosenAsset === NIMBORA_npfUSDC_ADDRESS) {
  //     maxYouCanBorrow = Math.round(100 * allValue[2] / 10**18) / 100;
  //   } else if (choosenAsset === NIMBORA_nstUSD_ADDRESS) {
  //     maxYouCanBorrow = Math.round(100 * allValue[3] / 10**18) / 100;
  //   }
  // }

  //ETH
  const { data: users_data, isLoading: users_loading } = useContractRead({
    address: contractAddress,
    abi: MyAbi,
    functionName: "frontend_get_all_offers",
    args: [category],
    watch: true,
  });
  const all_lending_offers = users_loading ? "..." : users_data;

  const { data: current_allowance_data, isLoading: current_allowance_loading } = useContractRead({
    address: choosenAsset,
    abi: Erc20Abi,
    functionName: "allowance",
    args: [account.address, contractAddress],
    watch: true,
  });
  let current_allowance = 0;
  if (choosenAsset) {
    const tmp = current_allowance_loading ? "..." : (current_allowance_data as any).remaining;
    if (tmp !== "...") { 
      current_allowance = Number(tmp.high.toString() + tmp.low.toString());
      console.log("Allowance", current_allowance);
    }
  }


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
      if (activeTab === "Just lend") {
        functionName = "make_lend_offer";
      } else {
        functionName = "make_borrow_offer";
      }

      let call = [];

      // Loop over all found offers
      let i = 0;
      console.log("offers", list_of_offers);
      let somme = 0;
      for (i = 0; i < list_of_offers.length; i ++) {
        console.log("offers i", list_of_offers[i]);
        const current_offer = list_of_offers[i][0];
        const amount = list_of_offers[i][1];


        // Make offer

        let calldata: Array<any>[] = [];
        // Token & amount
        calldata = calldata.concat([choosenAsset]);
        calldata = calldata.concat([amount, 0]);
        // Accepted collaterals
        if (activeTab === "Just lend") {
          calldata = calldata.concat([0, 0]);
        }
        // Price
        console.log("minimal time", minimalDuration);
        console.log("maximal time", maximalDuration);
        calldata = calldata.concat([
          Number(current_offer.price.rate) - PLATFORM_FEE_APY, 0,
          Math.round(minimalDuration * 3600),
          Math.round(maximalDuration * 3600)
        ]);
        // Token collateral & amount
        // Mouais pas trop compris pourquoi yavait ça !!!! todo pq ya ces deux parametres la
        if (activeTab === "Just borrow") {
          calldata = calldata.concat([
            choosenAsset,
            (Number(amount) * (10**Number(choosenDecimals))) / 10**18, 0 // TODO
          ]);
        }

        call.push({
            contractAddress: contractAddress,
            calldata: calldata.map((value) => String(value)),
            entrypoint: functionName
        })

        // Match offer
        call.push({
          contractAddress: contractAddress,
          calldata: ((activeTab === "Just lend") ? [Number(myid)+i, current_offer.id, amount, 0] : [current_offer.id, Number(myid)+i, amount, 0]).map((value) => String(value)),
          entrypoint: "match_offer"
        })

        // Disable previous lending/borrowing offer
        call.push({
          contractAddress: contractAddress,
          calldata: [Number(myid)+i].map((value) => String(value)),
          entrypoint: (activeTab === "Just lend") ? "disable_lend_offer" : "disable_borrow_offer"
        })
      }


      console.log("call2", call);

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

      toast.success("Your order was placed", {
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
            {["Just lend", "Just borrow"].map((tab) => (
            <button
            key={tab}
            className={`text-base px-4 py-2 ${activeTab === tab ? "buttonselected" : "bg-base"} rounded disabled:bg-gray-300 disabled:text-white`}
            onClick={() => {setChoosenAsset(""); setActiveTab(tab)}}
            >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
          </div>

        <div className="scroll">
        <div className="flex flex-col gap-y-5">
          {activeTab === "Just borrow" && (
            <>
            <div className="grid grid-cols-2 gap-x-5">
            <div className="flex flex-col justify-center">
            <h2>Amount of FETH in protocol:</h2>
            </div>
            <div className="flex flex-col justify-center">
            <h2>{protocol_balance_feth} FETH</h2>
            </div>
          </div> 
          </>
          )}
        <div className="grid grid-cols-2 gap-x-5">
          <div className="flex flex-col justify-center">
          <h2>Max you can {activeTab === "Just lend" ? "lend" : "borrow"} in {tokenUsed}</h2>
          </div>
          <div className="flex flex-col justify-center">
          <h2>{activeTab === "Just lend" ? maxYouCanLend : maxYouCanBorrow} {tokenUsed}</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-5">
          <div className="flex flex-col justify-center">
          <h2>Amount you want to {activeTab === "Just lend" ? "lend" : "borrow"} in {tokenUsed}</h2>
          </div>
          <div className="flex flex-col justify-center">
          <input
            type="text"
            className="w-full rounded text-base outline-none border-[2px]"
            value={inputAmount}
            onChange={(e) => {setInputAmount(e.target.value)}}
            // if (Number(e.target.value) > 0 || e.target.value === "")
            //   {setInputAmount(Math.min(Number(e.target.value), activeTab === "Just lend" ? Math.floor(maxYouCanLend) : Math.floor(maxYouCanBorrow)).toString())}
          />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-x-5">
          <div className="flex flex-col justify-center">
          <h2>Minimal duration of loan: {formatTime(minimalDuration)}<br/>
          {activeTab === "Just lend" ?
          "(The loan will last at least this duration, your yield is fixed on that period)" :
          "(The loan will last at least this duration, you will have to pay back the loan after this time)"}
          {/* {activeTab === "Just lend" ?
          "(Often, the lower the better is the yield)" :
          "(Often, the higher the better is the yield)"} */}
          </h2>
          </div>
          <div className="flex flex-col justify-center">
          <input
            type="range"
            className="w-full"
            min="1"
            max="1000"
            step="1"
            value={Math.log2(minimalDuration) * 100}
            onChange={(e) => setMinimalDuration(Math.pow(2, Number(e.target.value) / 100))}
          />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-x-5">
          <div className="flex flex-col justify-center">
          <h2>Maximal duration of loan: {formatTime(maximalDuration)}<br/>
          {activeTab === "Just lend" ?
          "(Before that time, you will get your money back. The loan needs to be repaid before this time)" :
          "(Before that time, you will have to pay back the loan, no matter what)"}
          {/* {activeTab === "Just lend" ?
          "(Often, the lower the better is the yield)" :
          "(Often, the higher the better is the yield)"} */}
          </h2>
          </div>
          <div className="flex flex-col justify-center">
          <input
            type="range"
            className="w-full"
            min="470"
            max="1000"
            step="1"
            value={Math.log2(maximalDuration) * 100}
            onChange={(e) => setMaximalDuration(Math.pow(2, Number(e.target.value) / 100))}
          />
          </div>
        </div>


        <div className="grid grid-cols-2 gap-x-5">
          <div className="flex flex-col justify-center">
            <h2>Yield you {activeTab === "Just lend" ? "get" : "pay"} in %</h2>
          </div>
          <div className="flex flex-col justify-center">
            <h2>{obtainedYield === "" ? "Offer to large for the market" : formatYield(Number(obtainedYield as String)) + (activeTab === "Just lend" ? -1 : 1) + "% (APR)"}</h2>
          </div>
        </div>


        {(maximalDuration - minimalDuration < 24) && (
          <div className="grid grid-cols-2 gap-x-5">
            <div className="flex flex-col justify-center">
            <h2 className="text-red-600">Difference between min and max duration needs to be at least 24hours</h2>
            </div>
            <div className="flex flex-col justify-center">
            <h2 className="text-red-600">Curent difference in hours: {Math.round(maximalDuration - minimalDuration)}</h2>
            </div>
          </div>
        )}

        </div>

        <hr className="border-[1px] border-white my-5" />

        <ChooseAsset
          type={activeTab === "Just lend" ? "lend" : "borrow"}
          baseAsset={tokenUsed}
          address={account.address}
          above_choosenAsset={choosenAsset}
          set_above_choosenAsset={setChoosenAsset}
        />


        <hr className="border-[1px] border-white my-5" />
        <SafetyBox
          valueamount={Number(inputAmount)}
          valueyield={valueYield * VALUE_1PERCENT_APY}
          minimal_duration={minimalDuration}
          maximal_duration={maximalDuration}
          type={activeTab === "Just lend" ? "lend" : "borrow"}
          isvalid={acceptDisclaimer}
          set_isvalid={setAcceptDisclaimer}
        />


        </div>
        


            <button
            className="w-full mt-7 py-3 rounded font-medium flex items-center gap-x-2 justify-center disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={
              isNaN(Number(inputAmount)) || Number(inputAmount) <= 0
              || !acceptDisclaimer
              || choosenAsset === ""
              || ((activeTab === "Just lend") && (Number(inputAmount) > maxYouCanLend))
              || ((activeTab === "Just borrow") && (Number(inputAmount) > maxYouCanBorrow))
              || (maximalDuration - minimalDuration < 24)
              || (obtainedYield === "")
            }
            title={
              isNaN(Number(inputAmount)) || Number(inputAmount) <= 0
              ? "Please enter a valid amount"
              : !acceptDisclaimer
              ? "Please tick the safety boxes with the text in red"
              : choosenAsset === ""
              ? "Please choose an asset"
              : (activeTab === "Just lend") && (Number(inputAmount) > maxYouCanLend)
              ? "Amount exceeds the maximum you can lend"
              : (activeTab === "Just borrow") && (Number(inputAmount) > maxYouCanBorrow)
              ? "Amount exceeds the maximum you can borrow"
              : (maximalDuration - minimalDuration < 24)
              ? "Difference between min and max duration needs to be at least 24 hours"
              : (obtainedYield === "")
              ? "Offer to large for the market"
              : "Deploy your offer !"
            }
            onClick={async (e) => {
              e.preventDefault();
              await handleExecute();
            }}
            >
            {activeTab === "Just lend" ? "Lend" : "Borrow"} at {formatYield(Number(obtainedYield as String)) + (activeTab === "Just lend" ? -1 : 1)}% APR
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
