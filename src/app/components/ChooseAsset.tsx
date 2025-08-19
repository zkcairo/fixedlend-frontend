"use client";
import { DisplayToken } from "./DisplayToken";
import { getAllLend, getAllCollateral, getAllBalance, normalizeAmountLend, normalizeAmountBorrow, prettyNameFromAddress } from "@/app/utils/erc20";
import { useState } from "react";

type Props = {
  type: "lend" | "borrow" | "all";
  baseAsset: string;
  address: string;
  above_choosenAsset: any;
  set_above_choosenAsset: any;
};


const ChooseAsset = ({ type, baseAsset, address, above_choosenAsset, set_above_choosenAsset }: Props) => {

  const allCollaterals: any[] = getAllCollateral(baseAsset);
  const allBalancesCollaterals = getAllBalance(allCollaterals.map((value) => value[0]), address);
  const filteredCollaterals = allCollaterals.filter((collateral, idx) => allBalancesCollaterals[idx] > 0);
  
  const allLend: any[] = getAllLend(baseAsset);
  const allBalancesLend = getAllBalance(allLend.map((value) => value[0]), address);
  const filteredLend = allLend.filter((lend, idx) => allBalancesLend[idx] > 0);

  console.log("baseAsset: ", baseAsset);
  console.log("above_choosenAsset: ", above_choosenAsset);
  console.log("filteredCollaterals: ", filteredCollaterals);
  console.log("filteredLend: ", filteredLend);

  const [choosenAsset, setChoosenAsset] = useState("");

  return (
    <div className="grid grid-cols-2 gap-x-5">
      <div className="flex flex-col justify-center">
      <label>{type === "all" ? "Choose your asset" : type === "lend" ? "Choose the asset you want to lend" : "Choose your collateral"}
        <br/><h2><a target="_blank" href="https://docs.FixedLend.com/FixedLend/accepted-collaterals"><u>List of all assets</u></a></h2>
      </label>
      </div>
      <div className="flex grid-col justify-center">
        {(type === "all" ? filteredLend.concat(filteredCollaterals) : type === "lend" ? filteredLend : filteredCollaterals).map((tab) => (
          <button
            key={tab[0]}
            className={`text-base px-4 py-2 ${choosenAsset === tab[0] ? "buttonselected" : "bg-base"} rounded`}
            onClick={() => {if (choosenAsset === tab[0]) { setChoosenAsset(""); set_above_choosenAsset("") } else { setChoosenAsset(tab[0]); set_above_choosenAsset(tab[0]) } }}
            >
            <DisplayToken address={tab[0]} />
          </button>
        ))}
        {(type === "all" ? filteredLend.concat(filteredCollaterals) : type === "lend" ? filteredLend : filteredCollaterals).length == 0 && (
          <div className="text-center text-lg">Currently, you do not have any {type === "all" ? "accepted assets" : type === "lend" ? "lendable" : "collateral"}.</div>
        )}
      </div>
    </div>
  )};

export default ChooseAsset;
