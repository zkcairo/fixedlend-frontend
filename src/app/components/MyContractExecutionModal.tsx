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
import { CONTRACT_ADDRESS, ETH_SEPOLIA, STRK_SEPOLIA, USDC_SEPOLIA } from "@/app/utils/constant";
import { formatCurrency } from "@/app/utils/format";
import { useContractRead } from "@starknet-react/core";

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
};

function scaleapy(n: number) {
  const scale = 10000;
  return 100 - 100*Math.pow(((scale - n) / scale), 87600);
}

function MyContractExecutionModal({ isOpen, onClose, account, tokenUsed }: Props) {

  const [callData, setCallData] = useState<string>("");
  const [errors, setErrors] = useState<Errors>({
    contractAddress: false,
    functionName: false,
    callData: true,
  });
  const [activeTab, setActiveTab] = useState("deposit");
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const contractAddress = CONTRACT_ADDRESS;

  const { data: eth, isLoading: ethLoading } = useContractRead({
    address: ETH_SEPOLIA,
    abi: Erc20Abi,
    functionName: "balance_of",
    args: [account.address],
    watch: true,
  });

  const { data: strk, isLoading: strkLoading } = useContractRead({
    address: STRK_SEPOLIA,
    abi: Erc20Abi,
    functionName: "balance_of",
    args: [account.address],
    watch: true,
  });

  const { data: usdc, isLoading: usdcLoading } = useContractRead({
    address: USDC_SEPOLIA,
    abi: Erc20Abi,
    functionName: "balance_of",
    args: [account.address],
    watch: true,
  });

  // @ts-ignore
  const ethBalance = formatCurrency(eth?.balance.low.toString());
  // @ts-ignore
  const strkBalance = formatCurrency(strk?.balance?.low.toString());
  // @ts-ignore
  const usdcBalance = formatCurrency(usdc?.balance?.low.toString());

  const tokenBalance_data = tokenUsed === "Eth" ? ethBalance : tokenUsed === "Strk" ? strkBalance : usdcBalance;
  const tokenBalance_loading = tokenUsed === "Eth" ? ethLoading : tokenUsed === "Strk" ? strkLoading : usdcLoading;
  const tokenBalance = tokenBalance_loading ? "Loading..." : tokenBalance_data;

  const userAddress = account.address;
  const tokenAddress = tokenUsed === "Eth" ? ETH_SEPOLIA : (tokenUsed === "Strk" ? STRK_SEPOLIA : USDC_SEPOLIA);

  const decimalsTokenPragma = tokenUsed === "Usdc" ? 20 : 8;
  const decimalsTokenContract = tokenUsed === "Eth" ? 10**18 : (tokenUsed === "Strk" ? 10**18 : 10**6);
  const inputAmount = String(Number(callData) * decimalsTokenContract);

  // 1 usdc qui est value / 10**8 $
  // Mais dans le code on a 10**dec usd
  // Donc faut faire tokens / 10**dec * value / 10**8
  console.log(inputAmount);

  const { data: assetPrice_data, isLoading: assetPrice_loading } = useContractRead({
    address: contractAddress,
    abi: MyAbi,
    functionName: "frontend_get_asset_price",
    args: [tokenAddress],
    watch: true,
  });
  const assetPrice = assetPrice_loading ? "Loading..." : Number(Number(assetPrice_data) / 10**decimalsTokenPragma).toFixed(2);

  const { data: lendApyRate_data, isLoading: lendApyRate_loading } = useContractRead({
    address: contractAddress,
    abi: MyAbi,
    functionName: "supply_apy",
    args: [tokenAddress],
    watch: true,
  });
  const lendApyRate = lendApyRate_loading ? "Loading..." : scaleapy(Number(lendApyRate_data)).toFixed(2) + "%";

  const { data: borrowApyRate_data, isLoading: borrowApyRate_loading } = useContractRead({
    address: contractAddress,
    abi: MyAbi,
    functionName: "borrow_apy",
    args: [tokenAddress],
    watch: true,
  });
  const borrowApyRate = borrowApyRate_loading ? "Loading..." : scaleapy(Number(borrowApyRate_data)).toFixed(2) + "%";

  const { data: depositedAmound_data, isLoading: depositedAmound_loading } = useContractRead({
    address: contractAddress,
    abi: MyAbi,
    functionName: "frontend_deposited_amount",
    args: [userAddress, tokenAddress],
    watch: true,
  });
  const depositedAmound = depositedAmound_loading ? "Loading..." : Number(depositedAmound_data) / decimalsTokenContract;

  const { data: borrowedAmound_data, isLoading: borrowedAmound_loading } = useContractRead({
    address: contractAddress,
    abi: MyAbi,
    functionName: "frontend_borrowed_amount",
    args: [userAddress, tokenAddress],
    watch: true,
  });
  const borrowedAmound = borrowedAmound_loading ? "Loading..." : Number(borrowedAmound_data) / decimalsTokenContract;

  const { data: totalDepositedAmound_data, isLoading: totalDepositedAmound_loading } = useContractRead({
    address: contractAddress,
    abi: MyAbi,
    functionName: "frontend_total_deposited_amount",
    args: [tokenAddress],
    watch: true,
  });
  const totalDepositedAmound = totalDepositedAmound_loading ? "Loading..." : Number(totalDepositedAmound_data) / decimalsTokenContract;

  const { data: utilizationRatio_data, isLoading: utilizationRatio_loading } = useContractRead({
    address: contractAddress,
    abi: MyAbi,
    functionName: "frontend_utilisation_rate",
    args: [userAddress],
    watch: true,
  });
  const utilizationRatio = utilizationRatio_loading ? "Loading..." : Number(utilizationRatio_data).toFixed(2) + "%";

  const { data: utilizationRatioAfterDeposit_data, isLoading: utilizationRatioAfterDeposit_loading } = useContractRead({
    address: contractAddress,
    abi: MyAbi,
    functionName: "frontend_utilisation_rate_after_deposit",
    args: [userAddress, tokenAddress, inputAmount],
    watch: true,
  });
  const utilizationRatioAfterDeposit = utilizationRatioAfterDeposit_loading ? "Loading..." : Number(utilizationRatioAfterDeposit_data).toFixed(2) + "%";

  const { data: utilizationRatioAfterBorrow_data, isLoading: utilizationRatioAfterBorrow_loading } = useContractRead({
    address: contractAddress,
    abi: MyAbi,
    functionName: "frontend_utilisation_rate_after_borrow",
    args: [userAddress, tokenAddress, inputAmount],
    watch: true,
  });
  const utilizationRatioAfterBorrow = utilizationRatioAfterBorrow_loading ? "Loading..." : Number(utilizationRatioAfterBorrow_data).toFixed(2) + "%";

  const { data: utilizationRatioAfterRepay_data, isLoading: utilizationRatioAfterRepay_loading } = useContractRead({
    address: contractAddress,
    abi: MyAbi,
    functionName: "frontend_utilisation_rate_after_repay",
    args: [userAddress, tokenAddress, inputAmount],
    watch: true,
  });
  const utilizationRatioAfterRepay = utilizationRatioAfterRepay_loading ? "Loading..." : Number(utilizationRatioAfterRepay_data).toFixed(2) + "%";







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

      const tocall = [tokenAddress, inputAmount, "0"];

      let call = [{
        contractAddress: contractAddress,
        calldata: tocall,
        entrypoint: functionName,
      }];
      // If deposit, add an approve to it
      if (activeTab === "deposit") {
        call = [
          {
            contractAddress: tokenAddress,
            calldata: [contractAddress, inputAmount, "0"],
            entrypoint: "approve"
          },
          call[0]];
      }
      console.log("call", call);

      // Ensure callData is formatted as expected
      const parsedCallData = tocall;
      if (!parsedCallData.every((item: any) => typeof item === "string")) {
        throw new Error("Call data items must be strings");
      }

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
      className="w-[90vw] mx-auto md:h-fit md:w-[45rem] text-white py-4 px-5 relative bg-black"
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
      <h1 className="text-[24px] mb-2 font-semibold">Thanks for using my app 🥺</h1>
      <div className="flex justify-around mb-4 flex-wrap">
        {["deposit", "withdraw", "borrow", "repay"].map((tab) => (
          <button
            key={tab}
            className={`text-base px-4 py-2 ${activeTab === tab ? "buttonselected" : "bg-base"} rounded`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      <form>
        <div className="flex flex-col gap-y-5">
          <div className="flex flex-col gap-y-2">
            <h2>Amount in {tokenUsed}</h2>
            <input
              type="text"
              className="w-full p-2 rounded text-base outline-none border-[2px]"
              value={callData}
              onChange={(e) => setCallDataValue(e.target.value)}
            />
          </div>
        </div>


        <br />

        {activeTab === "deposit" && (
          <div className="flex flex-col gap-y-5">
            <div className="flex flex-col gap-y-2">
              <h2>Asset price: {assetPrice}$</h2>
              <h2>Your input amount price: {Number(Number(callData)*Number(assetPrice)).toFixed(2)}$</h2>
              <br></br>--<br></br>
              <h2>Amount you already deposited in the protocol: {Number(depositedAmound).toFixed(3)}{tokenUsed}</h2>
              <h2>Max you can deposit (amount in your wallet): {Number(tokenBalance).toFixed(3)}{tokenUsed}</h2>
              <div className="hidden md:block">
              <br></br>--<br></br>
              <h2>Supply APY: {lendApyRate}</h2>
              <h2>Your utilization ratio now: {utilizationRatio}</h2>
              <h2>Your utilization ratio after your deposit: todo({utilizationRatioAfterDeposit})</h2>
              <h2>Max you can borrow after your deposit: todo</h2>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "withdraw" && (
          <div className="flex flex-col gap-y-5">
            <div className="flex flex-col gap-y-2">
              <h2>Asset price: {assetPrice}$</h2>
              <h2>Your input amount price: {Number(Number(callData)*Number(assetPrice)).toFixed(2)}$</h2>
              <br></br>--<br></br>
              <h2>Amount you already deposited in the protocol: {Number(depositedAmound).toFixed(3)}{tokenUsed}</h2>
              <h2>Max you can withdraw (according to your deposited assets): todo</h2>
              <div className="hidden md:block">
                <br></br>--<br></br>
                <h2>Supply APY: {lendApyRate}</h2>
                <h2>Your utilization ratio now: {utilizationRatio}</h2>
                <h2>Your utilization ratio after your withdraw: todo</h2>
              </div>
            </div>
          </div>
        )}

        {activeTab === "borrow" && (
          <div className="flex flex-col gap-y-5">
            <div className="flex flex-col gap-y-2">
              <h2>Asset price: {assetPrice}$</h2>
              <h2>Your input amount price: {Number(Number(callData)*Number(assetPrice)).toFixed(2)}$</h2>
              <br></br>--<br></br>
              <h2>Amount you already borrowed from the protocol: {Number(borrowedAmound).toFixed(3)}{tokenUsed}</h2>
              <h2>Max to borrow in the pool: {Number(totalDepositedAmound).toFixed(3)}{tokenUsed}</h2>
              <h2>Max you could borrow according to your deposit: todo</h2>
              <h2>So, max you can actually borrow (maximum of these 2 values): todo</h2>
              <div className="hidden md:block">
              <br></br>--<br></br>
              <h2>Borrow APY: {borrowApyRate}</h2>
              <h2>Your utilization ratio now: {utilizationRatio}</h2>
              <h2>Your utilization ratio after your borrow: todo ({utilizationRatioAfterBorrow})</h2>
              </div>
            </div>
          </div>
        )}

        {activeTab === "repay" && (
          <div className="flex flex-col gap-y-5">
            <div className="flex flex-col gap-y-2">
              <h2>Asset price: {assetPrice}$</h2>
              <h2>Your input amount price: {Number(Number(callData)*Number(assetPrice)).toFixed(2)}$</h2>
              <br></br>--<br></br>
              <h2>Currrent amount borrowed: {Number(borrowedAmound).toFixed(3)}{tokenUsed}</h2>
              <h2>Amount in your wallet: {Number(tokenBalance).toFixed(3)}{tokenUsed}</h2>
              <h2>Max you can repay (minimum of these 2 values): {Number(tokenBalance) < Number(borrowedAmound) ? Number(tokenBalance).toFixed(3) : Number(borrowedAmound).toFixed(3)}{tokenUsed}</h2>
              <div className="hidden md:block">
              <br></br>--<br></br>
              <h2>Borrow APY of this asset: {borrowApyRate}</h2>
              <h2>Amount borrowed after your repay: {(Number(borrowedAmound_data) - Number(inputAmount)).toFixed(3) + tokenUsed}</h2>
              <h2>Amount in your wallet after your repay: {(Number(tokenBalance) - Number(inputAmount)).toFixed(3) + tokenUsed}</h2>
              <h2>Your utilization ratio now: {utilizationRatio}</h2>
              <h2>Your utilization ratio after your repay: todo ({utilizationRatioAfterRepay})</h2>
              </div>
            </div>
          </div>
        )}

        <button
          className="w-full mt-7 py-3 rounded font-medium flex items-center gap-x-2 justify-center disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={isNaN(Number(callData)) || Number(callData) <= 0}
          onClick={async (e) => {
            e.preventDefault();
            await handleExecute();
          }}
        >
          Deploy transaction
          <Image
            src={loading ? spinner : rightArr}
            alt={loading ? "loading" : "right arrow"}
            height={16}
            width={16}
          />
        </button>
      </form>
    </GenericModal>
  );
}

export default MyContractExecutionModal;
