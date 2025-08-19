"use client";

import GenericModal from "./GenericModal";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Call } from "starknet";
import spinner from "../../../public/assets/spinner.svg";
import { CONTRACT_ADDRESS, ETH_ADDRESS } from '@/app/utils/constant';
import { getAllBalance, prettyNameFromAddress, getAllLend, getAllCollateral, getDecimalsOfAsset } from "../utils/erc20";
import { getErc20Balance, getProtocolBalance } from "../utils/fetch";
import toast from "react-hot-toast";
import { formatCurrency } from "../utils/format";
import ChooseAsset from "./ChooseAsset";

// --- Step 1: Define the new Child Component ---
// (You can move this to its own file and import it)
type CollateralBalanceRowProps = {
  assetAddress: string;
  accountAddress: string;
};

function CollateralBalanceRow({ assetAddress, accountAddress }: CollateralBalanceRowProps) {
  // Hooks are now at the top level of THIS component, which is correct!
  const walletBalance = getErc20Balance(assetAddress, accountAddress);
  const protocolBalance = getProtocolBalance(assetAddress, accountAddress);
  const assetName = prettyNameFromAddress(assetAddress);

  return (
    <>
      <div className="flex justify-between mt-2">
        <span>{assetName} in Wallet:</span>
        <span>{formatCurrency(Number(walletBalance))}</span>
      </div>
      <div className="flex justify-between">
        <span>{assetName} in Protocol:</span>
        <span>{formatCurrency(Number(protocolBalance), 10 ** 18)}</span>
      </div>
    </>
  );
}
// --- End of Child Component ---


type Props = {
  isOpen: boolean;
  onClose: () => void;
  account: any;
  tokenUsed: string;
  category: string;
  alloffers: any;
  disableBorrow: boolean;
};

function MyContractExecutionModal({ isOpen, onClose, account, tokenUsed, category, alloffers, disableBorrow }: Props) {
  
  const [inputAmount, setInputAmount] = useState<string>("");
  const [activeTab, setActiveTab] = useState("Deposit");
  const [choosenAsset, setChoosenAsset] = useState(ETH_ADDRESS);
  const [loading, setLoading] = useState<boolean>(false);
  const [animate, setAnimate] = useState(false);

  const contractAddress = CONTRACT_ADDRESS;

  const lendasset = getAllLend(tokenUsed)[0];
  const choosenAssetLend = lendasset[0].toString();
  const choosenDecimalsLend = lendasset[1];
  const tokenNameLend = prettyNameFromAddress(choosenAssetLend);

  const allCollaterals: any[] = getAllCollateral(tokenUsed);
  const allBalancesCollaterals = getAllBalance(allCollaterals.map((value) => value[0]), account.address);
  const filteredCollaterals = allCollaterals.filter((collateral, idx) => allBalancesCollaterals[idx] > 0);

  // Balances (for assets that are NOT in a loop)
  const account_balance_eth = formatCurrency(Number(getErc20Balance(choosenAssetLend, account.address)));
  const protocol_balance_eth = formatCurrency(Number(getProtocolBalance(choosenAssetLend, account.address)), 10**18);

  // Balances (for the selected asset in the dropdown)
  // We need to be careful here if 'choosenAsset' can change. Assuming it's a fixed address for now.
  const account_balance_selected = formatCurrency(Number(getErc20Balance(choosenAsset, account.address)));
  const protocol_balance_selected = formatCurrency(Number(getProtocolBalance(choosenAsset, account.address)), 10**18);

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
      const asset = choosenAsset;
      const decimals = Number(getDecimalsOfAsset(prettyNameFromAddress(choosenAsset)));
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

  const isButtonDisabled = isNaN(Number(inputAmount)) || Number(inputAmount) <= 0 || Number(inputAmount) > (activeTab === "Deposit" ? account_balance_selected : protocol_balance_selected);

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

      <div className="flex flex-col overflow-y-auto gap-y-4 text-lg">
        {/* Balances Panel */}
        <div className="border border-green-500/50 p-4 flex flex-col gap-2">
            <h3 className="text-xl tracking-wider mb-2">// BALANCES</h3>
            <div className="flex justify-between"><span>{tokenNameLend} in Wallet:</span><span>{account_balance_eth}</span></div>
            <div className="flex justify-between"><span>{tokenNameLend} in Protocol:</span><span>{protocol_balance_eth}</span></div>
            
            {/* --- Step 2: Use the new component in the loop --- */}
            {!disableBorrow && filteredCollaterals.map((asset) => (
              <CollateralBalanceRow 
                key={asset[0]} // Using the asset address as a key
                assetAddress={asset[0].toString()} 
                accountAddress={account.address} 
              />
            ))}
        </div>

        {/* Action Panel */}
        <div className="border border-green-500/50 p-4 flex flex-col gap-4">
            <h3 className="text-xl tracking-wider">// ACTION</h3>
              <ChooseAsset
              type={disableBorrow ? "lend" : "all"}
              baseAsset={"ETH"}
              address={account.address}
              above_choosenAsset={choosenAsset}
              set_above_choosenAsset={setChoosenAsset} />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <label htmlFor="amount-input">Amount in {prettyNameFromAddress(choosenAsset)}:</label>
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
        {loading ? "PROCESSING..." : `[ ${activeTab.toUpperCase()} ${prettyNameFromAddress(choosenAsset)} ]`}
        {loading && <Image src={spinner} alt="loading" height={20} width={20} className="animate-spin" />}
      </button>
    </GenericModal>
  );
}

export default MyContractExecutionModal;