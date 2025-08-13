"use client";

import Header from "../components/Header";
import Bottom from "../components/Bottom";
import { useAccount, useContractRead } from "@starknet-react/core";
import MyAbi from "../abi/mycontract.abi.json";
import { CONTRACT_ADDRESS } from "@/app/utils/constant";
import MatrixRain from "../components/MatrixRain";

export default function Page() {
  const { account } = useAccount();
  const contractAddress = CONTRACT_ADDRESS;
  const userAddress = String(account?.address);

  const { data: points_data, isLoading: points_loading } = useContractRead({
    address: contractAddress, abi: MyAbi, functionName: "frontend_get_user_points",
    args: [userAddress], watch: true,
  });
  const points = points_loading ? "Loading..." : Number(points_data);

  const { data: totalpoints_data, isLoading: totalpoints_loading } = useContractRead({
    address: contractAddress, abi: MyAbi, functionName: "frontend_get_total_points",
    args: [], watch: true,
  });
  const totalpoints = totalpoints_loading ? "Loading..." : Number(totalpoints_data);

  return (
    <>
      <MatrixRain />
      <div className="content-wrapper">
        <Header />
        <main className="container mx-auto py-10 px-4 flex flex-col items-center text-center mt-24 md:mt-12">
          <h1 className="text-6xl font-bold tracking-widest">Points</h1>
          
          <div className="w-full max-w-3xl mt-12 text-left text-lg leading-relaxed flex flex-col gap-y-6">
              <div>
                <p>{">"} Your points: {points === "Loading..." ? points : points.toExponential()}</p>
                <p>{">"} Total number of points: {totalpoints === "Loading..." ? totalpoints : totalpoints.toExponential()}</p>
              </div>

              <div>
                <h4 className="text-2xl mb-2 tracking-wider">How to Earn Points</h4>
                <p>{">"} Earn points by repaying loans. The platform fee you pay is added to your point total. For more details, see the <a href="https://docs.FixedLend.com/FixedLend/point-program" target="_blank">point program guide</a>.</p>
              </div>
{/* 
              <div>
                <h4 className="text-2xl mb-2 tracking-wider">Become a Market Maker</h4>
                <p>{">"} Sophisticated market makers wanted. If you can run bots to maintain offers within a given spread, DM me. A percentage of $FixedLend tokens is on offer. The more market makers, the better the platform.</p>
              </div> */}

              <div>
                <h4 className="text-2xl mb-2 tracking-wider">Disclaimer</h4>
                <p>{">"} Participation in the points program does not constitute a contractual right to an airdrop or any other form of compensation.</p>
              </div>
          </div>

          <div className="text-center mt-10">
            <button><a href="/earn" className="block w-full h-full py-2 px-4">Open the App</a></button>
          </div>
        </main>
        <Bottom />
      </div>
    </>
  );
}