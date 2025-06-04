"use client";

import Image from "next/image";
import Header from "./components/Header";
import Bottom from "./components/Bottom";
import MyAbi from "./abi/mycontract.abi.json";
import { useContractRead } from "@starknet-react/core";
import HeaderNoConnect from "./components/HeaderNoConnect";
import { formatCurrency, formatYield } from "./utils/format";
import { CONTRACT_ADDRESS, ETH_CATEGORY, USDC_CATEGORY } from "./utils/constant";



export default function Home() {
  const contractAddress = CONTRACT_ADDRESS;

  const { data: best_yield_eth_data, isLoading: best_yield_eth_loading } = useContractRead({
    address: contractAddress,
    abi: MyAbi,
    functionName: "frontend_best_available_yield",
    args: [ETH_CATEGORY],
    watch: true,
  });
  const bestYieldEthBorrow = best_yield_eth_loading ? "..." : formatYield((best_yield_eth_data as any[])[0]);
  const bestYieldEthLend = best_yield_eth_loading ? "..." : formatYield((best_yield_eth_data as any[])[1]);

  // const { data: best_yield_data_usdc, isLoading: best_yield_loading_usdc } = useContractRead({
  //   address: contractAddress,
  //   abi: MyAbi,
  //   functionName: "frontend_best_available_yield",
  //   args: [USDC_CATEGORY],
  //   watch: true,
  // });
  // const bestYieldUsdcLend = best_yield_loading_usdc ? "..." : formatYield((best_yield_data_usdc as any[])[0]);
  // const bestYieldUsdcBorrow = best_yield_loading_usdc ? "..." : formatYield((best_yield_data_usdc as any[])[1]);

  const { data: volume_eth_data, isLoading: volume_eth_loading } = useContractRead({
    address: contractAddress,
    abi: MyAbi,
    functionName: "frontend_available_to_lend_and_borrow",
    args: [ETH_CATEGORY],
    watch: true,
  });
  const volumeEthLend = volume_eth_loading ? "..." : formatCurrency((volume_eth_data as any[])[0]);
  const volumeEthBorrow = volume_eth_loading ? "..." : formatCurrency((volume_eth_data as any[])[1]);

  const { data: volume_usdc_data, isLoading: volume_usdc_loading } = useContractRead({
    address: contractAddress,
    abi: MyAbi,
    functionName: "frontend_available_to_lend_and_borrow",
    args: [USDC_CATEGORY],
    watch: true,
  });
  console.log("volume", volume_usdc_loading, volume_usdc_data);
  // const volumeUsdcLend = 0;
  // const volumeUsdcBorrow = 0;
  const volumeUsdcBorrow = volume_usdc_loading ? "..." : formatCurrency((volume_usdc_data as any[])[0]);
  const volumeUsdcLend = volume_usdc_loading ? "..." : formatCurrency((volume_usdc_data as any[])[1]);
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-between py-24 md:p-24">
      <HeaderNoConnect />
        <h1 className="text-6xl font-bold mt-15">FixedLend</h1>
        <center className="mt-5"><p className="text-2xl">
          A peer-to-peer lending app on Starknet.<br></br>
          Choose your yield, loan duration, and let the market take it.
        </p></center>
      <div className="border border-gray-300 rounded-lg p-8 mt-5">
        <ul className="text-xl">
          <h4 className="text-4xl font-bold mb-8">Platform Statistics</h4>
          <li>Current ETH yield (APR): {bestYieldEthBorrow}% lend / {bestYieldEthLend}% borrow</li>
          <li>Available on the ETH market: {volumeEthBorrow} ETH lend / {volumeEthLend} ETH borrow</li>
          {/* <li>Current USDC yield (APR): {Number(bestYieldUsdcLend)-1}% lend / {Number(bestYieldUsdcBorrow)+1}% borrow</li>
          <li>Available on USDC market: {volumeUsdcBorrow}$ to lend / {volumeUsdcLend}$ to borrow</li> */}
        </ul>
      </div>
        <div className="text-center mt-5">
          <button><a href="/earn">Open the app</a></button>
        </div>
        <div className="mb-50 text-center mt-10">
          <button><a href="http://twitter.com/zkcairo" target="_blank">Follow me on twitter</a></button>
        </div>
        <Bottom />
    </main>
  );
}
