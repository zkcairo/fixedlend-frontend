"use client";
import { DisplayToken } from "./DisplayToken";
import { getAllLend, getAllCollateral, getAllBalance, normalizeAmountLend, normalizeAmountBorrow, prettyNameFromAddress } from "@/app/utils/erc20";
import { useState } from "react";
import { VALUE_1PERCENT_APY } from "../utils/constant";

type Props = {
    valueamount: number;
    valueyield: number;
    minimal_duration: number;
    maximal_duration: number;
    type: "lend" | "borrow";
    takeormake: boolean;
    isvalid: boolean;
    set_isvalid: any;
};

const SafetyBox = ({ valueamount, valueyield, minimal_duration, maximal_duration, type, takeormake, isvalid, set_isvalid }: Props) => {

    const [isvalid1, set_isvalid1] = useState(false);
    const [isvalid2, set_isvalid2] = useState(false);
    const [isvalid3, set_isvalid3] = useState(false);

    console.log(isvalid1, isvalid2, isvalid3);

    let isvalid1_used = false;
    isvalid1_used ||= (type === "lend" && valueyield < 5 * VALUE_1PERCENT_APY);
    isvalid1_used ||= (type === "borrow" && valueyield > 30 * VALUE_1PERCENT_APY);
    let isvalid2_used = false;
    isvalid2_used ||= (type === "lend" && maximal_duration > 10 * 24);
    isvalid2_used ||= (type === "borrow" && minimal_duration > 10 * 24);
    isvalid2_used ||= (type === "borrow" && !takeormake && minimal_duration < 3 * 24);
    isvalid2_used ||= (type === "borrow" && takeormake && maximal_duration < 3 * 24);
    let isvalid3_used = false;
    isvalid3_used ||= (valueamount > 0.1);
    isvalid3_used ||= (valueamount > 1);

    console.log(isvalid1_used, isvalid2_used, isvalid3_used);

    let is_valid = isvalid1_used ? isvalid1 : true;
    is_valid &&= isvalid2_used ? isvalid2 : true;
    is_valid &&= isvalid3_used ? isvalid3 : true;
    console.log("is_valid", is_valid);
    set_isvalid(is_valid);

    return (
        <>
            {type === "lend" && valueyield < 5 * VALUE_1PERCENT_APY && (
                <div className="grid grid-cols-2 gap-x-5">
                    <div className="flex flex-col justify-center">
                        <h2 className="text-red-600">
                            Your lend yield is quite low, below 5% APR, are you sure you want to proceed?
                        </h2>
                    </div>
                    <div className="flex grid-col justify-center">
                        <input id="checked1" type="checkbox" className="w-6 accent-[#0f0]" checked={isvalid1} onChange={() => set_isvalid1(!isvalid1)} />
                    </div>
                </div>
            )}
            {type === "borrow" && valueyield > 30 * VALUE_1PERCENT_APY && (
                <div className="grid grid-cols-2 gap-x-5">
                    <div className="flex flex-col justify-center">
                        <h2 className="text-red-600">
                            Your borrow yield is quite high, above 30% APR, are you sure you want to proceed?
                        </h2>
                    </div>
                    <div className="flex grid-col justify-center">
                        <input id="checked1" type="checkbox" className="w-6 accent-[#0f0]" checked={isvalid1} onChange={() => set_isvalid1(!isvalid1)} />
                    </div>
                </div>
            )}
            {type === "lend" && maximal_duration > 10 * 24 && (
                <div className="grid grid-cols-2 gap-x-5 mt-5">
                    <div className="flex flex-col justify-center">
                        <h2 className="text-red-600">
                            Your entered maximal duration is quite high, above 10 days.
                            This means a borrower can borrow your asset for 10 days and you have no right to withdraw it before the end of the duration.
                            Are you sure you want to proceed?
                        </h2>
                    </div>
                    <div className="flex grid-col justify-center">
                        <input id="checked1" type="checkbox" className="w-6 accent-[#0f0]" checked={isvalid2} onChange={() => set_isvalid2(!isvalid2)} />
                    </div>
                </div>
            )}
            {type === "borrow" && minimal_duration > 10 * 24 && (
                <div className="grid grid-cols-2 gap-x-5 mt-5">
                    <div className="flex flex-col justify-center">
                        <h2 className="text-red-600">
                            Your entered minimal duration is quite high, above 10 days.
                            This means you have to pay back the loan after 10 days, no matter what.
                            You CANNOT pay back early to get back your collateral.
                            Are you sure you want to proceed?
                        </h2>
                    </div>
                    <div className="flex grid-col justify-center">
                        <input id="checked1" type="checkbox" className="w-6 accent-[#0f0]" checked={isvalid2} onChange={() => set_isvalid2(!isvalid2)} />
                    </div>
                </div>
            )}
            {type === "borrow" && !takeormake && minimal_duration < 3 * 24 && (
                <div className="grid grid-cols-2 gap-x-5 mt-5">
                    <div className="flex flex-col justify-center">
                        <h2 className="text-red-600">
                            Your entered minimal duration is quite low, below 3 days.
                            Because you propose an offer, anyone can lend you the asset
                            for only "your duration"+1 days without any confirmation/action needed from you, and you NEED
                            to pay back within this duration. Are you sure you want to proceed?
                            These type of loans need constant monitoring, you WILL get liquidated otherwise.
                            Please proceed only if you know what you are doing.
                        </h2>
                    </div>
                    <div className="flex grid-col justify-center">
                        <input id="checked1" type="checkbox" className="w-6 accent-[#0f0]" checked={isvalid2} onChange={() => set_isvalid2(!isvalid2)} />
                    </div>
                </div>
            )}
            {type === "borrow" && takeormake && maximal_duration < 3 * 24 && (
                <div className="grid grid-cols-2 gap-x-5 mt-5">
                    <div className="flex flex-col justify-center">
                        <h2 className="text-red-600">
                            Your choosen maximal duration is quite low, below 3 days.
                            You need to pay back your loan within 3days, otherwise you will get liquidated.
                            Are you sure you want to proceed?
                        </h2>
                    </div>
                    <div className="flex grid-col justify-center">
                        <input id="checked1" type="checkbox" className="w-6 accent-[#0f0]" checked={isvalid2} onChange={() => set_isvalid2(!isvalid2)} />
                    </div>
                </div>
            )}
            {valueamount > 0.1 && (
                <div className="grid grid-cols-2 gap-x-5 mt-5">
                    <div className="flex flex-col justify-center">
                        <h2 className="text-red-600">
                            You {takeormake ? "take" : "make"} an offer for over 0.1eth.
                            Are you sure you want to proceed?
                        </h2>
                    </div>
                    <div className="flex grid-col justify-center">
                        <input id="checked1" type="checkbox" className="w-6 accent-[#0f0]" checked={isvalid3} onChange={() => set_isvalid3(!isvalid3)} />
                    </div>
                </div>
            )}
            {valueamount > 1 && (
                <div className="grid grid-cols-2 gap-x-5 mt-5">
                    <div className="flex flex-col justify-center">
                        <h2 className="text-red-600">
                            You {takeormake ? "take" : "make"} an offer for over 1eth.
                            Are you sure you want to proceed?
                            I'm not liable for any loss incurred.
                            Also, hop into our <a href="https://discord.gg/mN8gZUgFS7" target="_blank">Discord</a> and
                            ask any question you may have before proceeding.
                            <br />
                            (And ty :3 for using the platform)
                        </h2>
                    </div>
                    <div className="flex grid-col justify-center">
                        <input id="checked1" type="checkbox" className="w-6 accent-[#0f0]" checked={isvalid3} onChange={() => set_isvalid3(!isvalid3)} />
                    </div>
                </div>
            )}
        </>
    );
};

export default SafetyBox;