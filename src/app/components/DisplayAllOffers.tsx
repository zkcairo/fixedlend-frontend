"use client";
import { sortByYield } from "@/app/utils/array";
import { formatTime, formatCurrency, formatYield, formatDate } from "../utils/format";
import { categoryName, prettyNameFromAddress } from "../utils/erc20";
import { computeInterest } from "../utils/interest";
import { DisplayCollateral } from "./DisplayCollateral";

type Props = {
  offers: any[];
  loading: boolean;
  type: "lend" | "borrow" | "loan";
  me: boolean;
  labelButton: string;
  action: any;
  category: any;
};

const AllOffers = ({ offers, loading, type, me, labelButton, action, category }: Props) => {
  const currentDate = new Date();

  if (loading) {
    return <div className="text-center p-8">Loading available offers...</div>;
  }
  
  if (!offers || offers.length === 0) {
      return <div className="text-center p-8">No active offers found.</div>;
  }

  const renderOffer = (offer: any, index: number) => (
    <div key={index} className="flex flex-col gap-y-1 p-4 border border-green-500/30">
      <h3 className="text-xl font-bold tracking-wider">Offer #{offer.id.toString()}</h3>
      <p>Available: {formatCurrency(Number(offer.amount_available))} {categoryName(category)}</p>
      {me && <p>Total Size: {formatCurrency(Number(offer.total_amount))} {categoryName(category)}</p>}
      <p>Yield: {formatYield(Number(offer.price.rate)) + (me ? 0 : type === "lend" ? 1 : -1)}% APR</p>
      <p>Duration: {formatTime(Number(offer.price.minimal_duration) / 3600)} - {formatTime(Number(offer.price.maximal_duration) / 3600)}</p>
      {type === "borrow" && <p>Collateral: <DisplayCollateral offer={offer} me={me} /></p>}
      <button className="mt-2" onClick={(e) => { e.preventDefault(); action(offer.id); }}>
        {labelButton}
      </button>
    </div>
  );

  const renderLoan = (loan: any, index: number, loanType: 'borrow' | 'lend') => {
      const isBorrow = loanType === 'borrow';
      const rate = isBorrow ? loan.borrowing_rate : loan.lending_rate;
      const interest = computeInterest(Number(loan.amount), Number(rate), currentDate.getTime() / 1000 - Number(loan.date_taken));
      console.log(rate);
      console.log(interest);
      console.log(loan.amount);
      const canRepay = currentDate >= new Date(1000 * Number(loan.date_taken + loan.minimal_duration)) && currentDate <= new Date(1000 * Number(loan.date_taken + loan.maximal_duration));
      const canLiquidate = currentDate > new Date(1000 * Number(loan.date_taken + loan.maximal_duration));

      return (
          <div key={index} className="flex flex-col gap-y-1 p-4 border border-green-500/30">
              <h3 className="text-xl font-bold tracking-wider">Loan #{loan.id.toString()} (you {loanType})</h3>
              <p>Amount: {formatCurrency(Number(loan.amount))} {categoryName(category)}</p>
              <p>APR: {formatYield(rate)}%</p>
              <p>Repay After: {formatDate(loan.date_taken + loan.minimal_duration)}</p>
              <p>Repay Before: {formatDate(loan.date_taken + loan.maximal_duration)}</p>
              <p>Current Value: {formatCurrency(interest)} {categoryName(category)}</p>
              {!isBorrow && <p>Interest Earned: {formatCurrency(interest - Number(loan.amount), 10**18)} {categoryName(category)}</p>}
              <button
                  className="mt-2"
                  disabled={!canRepay && !canLiquidate}
                  onClick={(e) => { e.preventDefault(); canRepay ? action(["repay_offer", loan.id]) : action(["liquidate_offer", loan.id]) }}
              >
                  {canRepay ? "Repay" : "Liquidate"}
              </button>
          </div>
      );
  };

  if (type === 'loan') {
    const borrowLoans = (offers as any[])[0]?.map((o: any) => ({ ...o[0], token: o[1] })).filter((l: any) => l.is_active) || [];
    const lendLoans = (offers as any[])[1]?.map((o: any) => ({ ...o[0], token: o[1] })).filter((l: any) => l.is_active) || [];
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2 max-h-[60vh] overflow-y-auto">
            {borrowLoans.map((loan: any, index: number) => renderLoan(loan, index, 'borrow'))}
            {lendLoans.map((loan: any, index: number) => renderLoan(loan, index, 'lend'))}
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2 max-h-[60vh] overflow-y-auto">
      {sortByYield(offers, type).map(renderOffer)}
    </div>
  );
};

export default AllOffers;