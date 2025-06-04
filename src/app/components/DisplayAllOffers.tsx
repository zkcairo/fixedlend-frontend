"use client";
import { DisplayToken } from "./DisplayToken";
import { DisplayCollateral } from "./DisplayCollateral";
import { sortByYield } from "@/app/utils/array";
import { formatTime, formatCurrency, formatYield, formatCollateral, formatDate } from "../utils/format";
import { categoryName, getDecimalsOfAsset, prettyNameFromAddress } from "../utils/erc20";
import { computeInterest } from "../utils/interest";

type Props = {
  offers: any[];
  loading: boolean;
  type: "lend" | "borrow" | "loan" | "collateral";
  me: boolean;
  labelButton: string;
  action: any;
  category: any;
};

const AllOffers = ({ offers, loading, type, me, labelButton, action, category }: Props) => {
  const currentDate = new Date();

  return (
    <>
    {loading ? (
      <h2>Loading...</h2>
    ) : (
      <div className="flex flex-col gap-y-5 scroll">
        <div className="grid grid-cols-2 gap-4">
        {(type === "lend" || type === "borrow") && (sortByYield(offers, type).map((offer: any, index: number) => (
          <div key={index} className="flex flex-col gap-y-2">
            <h2>Offer {1 + index} (id {offer.id.toString()}):</h2>
            {(type === "lend" && (<h3>Offer asset: {categoryName(category)}</h3>))
            || (type === "borrow" && (<h3>Collateral: <DisplayCollateral offer={offer} me={me}/></h3>))}
            {me ? <><h3>Total offer size: {formatCurrency(Number(offer.total_amount))} {categoryName(category)}</h3></> : <></>}
            <h3>Available amount: {formatCurrency(Number(offer.amount_available))} {categoryName(category)}</h3>
            {/* {me ? <h3>Loaned amount: {formatCurrency(Number(offer.total_amount - offer.amount_available))}$</h3> : <></>} */}
            <h3>
              {!me ?
                type === "lend" ? "Yield you pay" : "Yield you get"
                : "Asked yield"}: {formatYield(Number(offer.price.rate)) + (me ? 0 : type === "lend" ? 1 : -1)}%</h3>
            <h3>Min/Max duration: {formatTime(Number(offer.price.minimal_duration)/3600)} - {formatTime(Number(offer.price.maximal_duration)/3600)}</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                title={me ? "To prevent further action with this offer, disable it." : "To "+(type==="lend"?"borrow from":"lend to")+" this offer, click the button."}
                className="mt-1 rounded py-1 px-12 flex items-center justify-center disabled:cursor-not-allowed disabled:bg-slate-300"
                onClick={async (e) => {
                  action(offer.id);
                  e.preventDefault();
                }}
              >
                {labelButton}
              </button>
            </div>
          </div>
        )))}
        {/* Type: BORROW */}
        {(type === "loan") && ((offers as any[])[0]
                              .map((offer: any) => { let res = offer[0]; res.token = offer[1]; return res })
                              .filter((offer: any) => offer.is_active)
                              .map((offer: any, index: number) => (
          <div key={index} className="flex flex-col gap-y-2">
            <h2>Loan id {offer.id.toString()} (you borrow):</h2>
            {/* <h3>Lending/Borrowing offer id: {offer.lending_offer_id.toString()} / {offer.borrowing_offer_id.toString()}</h3> */}
            <h3>Date loan taken: {formatDate(offer.date_taken)}</h3>
            <h3>Loan amount: {formatCurrency(Number(offer.amount))} in {categoryName(category)}</h3>
            <h3>APR: {formatYield(offer.borrowing_rate)}%</h3>
            <h3>Repay after: {formatDate(offer.date_taken + offer.minimal_duration)}</h3>
            <h3>Repay before: {formatDate(offer.date_taken + offer.maximal_duration)}</h3>
            <h3>Current repayment value: {formatCurrency(computeInterest(Number(offer.amount), Number(offer.borrowing_rate), currentDate.getTime() / 1000 - Number(offer.date_taken)))} {categoryName(category)}</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                title={
                  (currentDate < new Date(1000 * Number(offer.date_taken + offer.minimal_duration))) ?
                    "You can't repay yet the loan, you need to wait until " + formatDate(offer.date_taken + offer.minimal_duration) + " to repay" :
                    (new Date(1000 * Number(offer.date_taken + offer.maximal_duration)) < currentDate) ?
                    "You can't repay, you had to repay before " + formatDate(offer.date_taken + offer.maximal_duration) + " you will get liquidated soon" :
                    "Repay the loan!"
                  }
                className="mt-1 rounded py-1 px-12 flex items-center justify-center disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={
                  ((currentDate < new Date(1000 * Number(offer.date_taken + offer.minimal_duration))) ||
                  (new Date(1000 * Number(offer.date_taken + offer.maximal_duration)) < currentDate))
                }
                onClick={async (e) => {
                  action([offer.id, offer.token, computeInterest(Number(offer.amount), Number(offer.borrowing_rate), currentDate.getTime() / 1000 - Number(offer.date_taken))]);
                  e.preventDefault();
                }}
              >
                Repay
              </button>
            </div>
          </div>
        )))}
        {/* TODO: METTRE OFFER[0] et offer[1] à la place de offer ici plus bas dans loan */}
        {/* Type: LEND */}
        {(type === "loan") && ((offers as any[])[1]
                              .map((offer: any) => { let res = offer[0]; res.token = offer[1]; return res })
                              .filter((offer: any) => offer.is_active)
                              .map((offer: any, index: number) => (
          <div key={index} className="flex flex-col gap-y-2">
            <h2>Loan id {offer.id.toString()} (you lend):</h2>
            {/* <h3>Lending/Borrowing offer id: {offer.lending_offer_id.toString()} / {offer.borrowing_offer_id.toString()}</h3> */}
            <h3>Date loan taken: {formatDate(offer.date_taken)}</h3>
            <h3>Loan amount: {formatCurrency(Number(offer.amount))} in {categoryName(category)}</h3>
            <h3>APR: {formatYield(offer.lending_rate)}%</h3>
            <h3>Repay after: {formatDate(offer.date_taken + offer.minimal_duration)}</h3>
            <h3>Repay before: {formatDate(offer.date_taken + offer.maximal_duration)}</h3>
            <h3>Current value: {formatCurrency(computeInterest(Number(offer.amount), Number(offer.lending_rate), currentDate.getTime() / 1000 - Number(offer.date_taken)))} {categoryName(category)}</h3>
            <h3>Earnt interest: {formatCurrency(computeInterest(Number(offer.amount), Number(offer.lending_rate), currentDate.getTime() / 1000 - Number(offer.date_taken)) - Number(offer.amount))} {categoryName(category)}</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                title={
                    (new Date(1000 * Number(offer.date_taken + offer.maximal_duration)) < currentDate) ?
                    "Liquidate" :
                    "You can't liquidate yet, you need to wait until " + formatDate(offer.date_taken + offer.maximal_duration)
                  }
                className="mt-1 rounded py-1 px-12 flex items-center justify-center disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={new Date(1000 * Number(offer.date_taken + offer.maximal_duration)) >= currentDate}
                onClick={async (e) => {
                  action(offer.id);
                  e.preventDefault();
                }}
              >
                Liquidate
              </button>
            </div>
          </div>
        )))}
        </div>
        </div>
    )}
    </>
  );
};

export default AllOffers;
