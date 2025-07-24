"use client";

import HeaderNoConnect from "./components/HeaderNoConnect";
import Bottom from "./components/Bottom";
import MyAbi from "./abi/mycontract.abi.json";
import { useContractRead } from "@starknet-react/core";
import { formatCurrency, formatYield } from "./utils/format";
import { CONTRACT_ADDRESS, ETH_ADDRESS, ETH_CATEGORY, FETH_ADDRESS, USDC_CATEGORY } from "./utils/constant";
import MatrixRain from "./components/MatrixRain";
import { getErc20Balance } from "./utils/fetch";

export default function Home() {
  const contractAddress = CONTRACT_ADDRESS;

  const { data: best_yield_eth_data, isLoading: best_yield_eth_loading } = useContractRead({
    address: contractAddress, abi: MyAbi, functionName: "frontend_best_available_yield",
    args: [ETH_CATEGORY], watch: true,
  });
  const bestYieldEthBorrow = best_yield_eth_loading ? "..." : formatYield((best_yield_eth_data as any[])[0]);
  const bestYieldEthLend = best_yield_eth_loading ? "..." : formatYield((best_yield_eth_data as any[])[1]);

  const { data: volume_eth_data, isLoading: volume_eth_loading } = useContractRead({
    address: contractAddress, abi: MyAbi, functionName: "frontend_available_to_lend_and_borrow",
    args: [ETH_CATEGORY], watch: true,
  });
  const volumeEthBorrow = volume_eth_loading ? "..." : formatCurrency((volume_eth_data as any[])[0]);
  const volumeEthLend = volume_eth_loading ? "..." : formatCurrency((volume_eth_data as any[])[1]);

  const ethBalance = getErc20Balance(ETH_ADDRESS, contractAddress);
  const fethBalance = getErc20Balance(FETH_ADDRESS, contractAddress);

  return (
    <>
      <MatrixRain />
      <div className="content-wrapper">
        <HeaderNoConnect />
        <main className="container mx-auto py-10 px-4 flex flex-col items-center text-center">
          <h1 className="text-6xl font-bold mt-20 tracking-widest">FixedLend</h1>
          <p className="text-2xl mt-5 max-w-2xl">
            A peer-to-peer lending app on Starknet.<br/>
            Fixed APY, Fixed duration, loans.
          </p>
          <p className="text-2xl mt-5 max-w-2xl"><a href="https://docs.fixedlend.com/fixedlend/security/audits" target="_blank" rel="noopener noreferrer">Code is audited!</a></p>

          <div className="w-full max-w-2xl mt-12 text-left text-lg leading-relaxed p-6 border border-green-500/50 shadow-[inset_0_0_10px_rgba(0,255,0,0.3)]">
            <h4 className="text-3xl font-bold mb-6 text-center tracking-wider">Platform Statistics</h4>
            <p>{">"} TLV: {formatCurrency(Number(ethBalance) + Number(fethBalance))} ETH</p>
            <p className="mt-2">{">"} Current ETH yield (APR): {Number(bestYieldEthBorrow) - 1}% lend / {Number(bestYieldEthLend) + 1}% borrow</p>
            <p className="mt-2">{">"} Available on the ETH market: {volumeEthBorrow} ETH to lend / {volumeEthLend} ETH to borrow</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <button>
              <a href="/earn" className="block w-full h-full py-2 px-4">Open the App</a>
            </button>
          </div>
        </main>
        <Bottom />
      </div>
    </>
  );
}