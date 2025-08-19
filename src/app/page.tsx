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
          {/* Hero */}
          <header className="w-full max-w-4xl mt-16">
            <h1 className="text-6xl font-bold tracking-widest">FixedLend</h1>
            <h2 className="text-3xl mt-4 text-slate-200">Meet the Yield Order Book.</h2>
            <p className="mt-6 text-lg max-w-3xl mx-auto leading-relaxed">
              Lenders: Earn predictable fixed-rate yield without pooled dilution.<br/>
              Borrowers: Leverage your DeFi positions.
            </p>

            {/* Launch CTA */}
            <div className="mt-8 flex justify-center">
              <a
                href="/earn"
                className="inline-flex items-center justify-center rounded-2xl px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-400 text-black font-semibold shadow-2xl hover:scale-[1.01] transition-transform"
              >
                Launch App
              </a>
            </div>

            {/* Audited note near CTA */}
            <p className="mt-4 text-sm text-slate-300">
              Smart contracts audited. <a className="underline" href="https://docs.fixedlend.com/fixedlend/security/audits" target="_blank" rel="noopener noreferrer">View audits</a>.
            </p>
          </header>


          {/* Where the yield comes from section */}
          <section className="max-w-5xl mt-12 text-center leading-relaxed p-8 bg-slate-900/60 border border-slate-700 rounded-2xl shadow-lg">
            <h4 className="text-3xl font-bold mb-6 tracking-wider">Where Does the Yield Come From?</h4>
            <p className="mb-2">
              Borrowers want to leverage their DeFi positions. In exchange, they are willing to pay a portion of their earned yield to lenders. For example, if they have access to a 10% APR position, they can pay you a fixed 7% and still make a profit.
            </p>
            <p className="mb-2">
              Lenders simply collect this yield, in a fixed and predictable manner, without needing to research the best or latest DeFi strategies themselves.
            </p>
            <p>
              The collateral's value is always pegged to the borrowed asset. This design makes price fluctuations between different assets irrelevant to the protocol's stability.
            </p>
          </section>


          <div className="w-full max-w-7xl mx-auto mt-12 flex flex-col lg:flex-row gap-8 items-start px-4">            
            {/* Lenders section */}
            <section className="w-full lg:w-1/2 text-left text-lg leading-relaxed p-8 bg-slate-900/60 border border-slate-700 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold mb-4">How Lenders Use FixedLend</h3>

              <h4 className="text-xl font-semibold mt-4">1) Deposit Your Assets</h4>
              <p className="mt-2">
                Start by depositing the asset you want to lend (for example, ETH).
              </p>

              <h4 className="text-xl font-semibold mt-4">2) Choose a Lending Strategy</h4>
              <p className="mt-2">
                FixedLend supports two primary strategies: One-Time or Recurring loans.
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>
                  <strong>One-Time Loan:</strong> Take the best available borrower's offer for a single, non-renewing loan. This is ideal if you want a single fixed-term engagement.
                </li>
                <li className="mt-2">
                  <strong>Recurring Loan Offer:</strong> Create a maker order that stays active on the order book. When a borrower accepts your offer, the loan is executed. After repayment, your offer automatically returns to the book, allowing you to act as a continuous liquidity provider without manual intervention.
                </li>
              </ul>

              <h4 className="text-xl font-semibold mt-4">3) Active Loans</h4>
              <p className="mt-2">
                Once a borrower accepts your offer, your funds are transferred and collateral is locked in the contract. You begin earning fixed yield immediately. At maturity, the borrower can repay, and you reclaim your principal plus interest. If they fail to repay on time, liquidation is available to protect your funds.
              </p>

              <h4 className="text-xl font-semibold mt-4">4) Withdrawals</h4>
              <p className="mt-2">
                You retain full control. You can disable your recurring offers at any time to prevent new loans. Principal and earned interest can be withdrawn as soon as loans are completed or if you liquidate an eligible overdue loan.
              </p>
            </section>

            {/* Borrowers section */}
            <section className="w-full lg:w-1/2 text-right text-lg leading-relaxed p-8 bg-slate-900/60 border border-slate-700 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold mb-4">How Borrowers Use FixedLend</h3>

              <h4 className="text-xl font-semibold mt-4">1) Deposit Your DeFi Position</h4>
              <p className="mt-2">
                Start by depositing the single-exposure DeFi position you wish to leverage (for example, fETH, a yield-bearing ETH asset).
              </p>

              <h4 className="text-xl font-semibold mt-4">2) Place Offers on the Order Book</h4>
              <p className="mt-2">
                To borrow profitably, you should only place offers when the interest you pay is lower than the yield you earn from your DeFi position. The affordable APR depends on the loan duration and your position's current yield.
              </p>

              <h4 className="text-xl font-semibold mt-4">3) Borrow the Underlying Asset</h4>
              <p className="mt-2">
                Borrow the non-yield-bearing asset related to your collateral (for instance, borrow ETH if you deposited fETH). Currently, only ETH is supported, with more assets coming soon.
              </p>
              
              <h4 className="text-xl font-semibold mt-4">4) Leverage Your Position</h4>
              <p className="mt-2">
                Use the borrowed assets to increase your DeFi position, thereby amplifying your yield. At the end of the loan term, you can renew it or unwind your leveraged position to repay the loan.
              </p>

              <h4 className="text-xl font-semibold mt-4">5) Deploy Your Bots (Coming Soon)</h4>
              <p className="mt-2">
                Effective yield farming requires constant market monitoring. We will provide automated tools for this as the market matures. For now, the FixedLend team is the primary borrower, and we plan to decentralize the borrowing side as soon as possible.
              </p>
            </section>
          </div>

          {/* Bottom CTA */}
          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <a href="/earn" className="inline-flex items-center justify-center rounded-2xl px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-400 text-black font-semibold shadow-2xl hover:scale-[1.01] transition-transform">
              Open the App
            </a>
          </div>

          {/* Platform statistics — DO NOT CHANGE THIS SECTION */}
          <section className="mt-12 text-center leading-relaxed p-8 bg-slate-900/60 border border-slate-700 rounded-2xl shadow-lg">
            <h4 className="text-3xl font-bold mb-6 tracking-wider">Platform Statistics</h4>
            {/* <p>TVL: {formatCurrency(Number(ethBalance) + Number(fethBalance))} ETH</p> */}
            <p className="mt-2">Current ETH yield (APR): {Number(bestYieldEthBorrow) - 1}% lend / {Number(bestYieldEthLend) + 1}% borrow</p>
            <p className="mt-2">Available on the ETH market: {volumeEthBorrow} ETH to lend / {volumeEthLend} ETH to borrow</p>
          </section>

          {/* Security section */}
          <section className="mt-12 text-center leading-relaxed p-8 bg-slate-900/60 border border-slate-700 rounded-2xl shadow-lg">
            <h4 className="text-2xl font-semibold">Security</h4>
            <p className="mt-2">
              FixedLend's smart contracts have been audited. You can review the audit report <a className="underline" href="https://docs.fixedlend.com/fixedlend/security/audits" target="_blank" rel="noopener noreferrer">here</a>.
            </p>
          </section>


        </main>
        <Bottom />
      </div>
    </>
  );
}