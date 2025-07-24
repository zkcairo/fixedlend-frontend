"use client";
import { useState, useEffect } from "react";
import { VALUE_1PERCENT_APY } from "../utils/constant";

type Props = {
    valueamount: number;
    valueyield: number;
    minimal_duration: number;
    maximal_duration: number;
    type: "lend" | "borrow";
    takeormake?: boolean; // True for 'take', false/undefined for 'make'
    isvalid: boolean;
    set_isvalid: (isValid: boolean) => void;
};

const SafetyBox = ({ valueamount, valueyield, minimal_duration, maximal_duration, type, takeormake = false, set_isvalid }: Props) => {
    const [checks, setChecks] = useState<{ [key: string]: boolean }>({});

    const warnings = {
        lowYield: type === "lend" && valueyield < 5 * VALUE_1PERCENT_APY,
        highYield: type === "borrow" && valueyield > 30 * VALUE_1PERCENT_APY,
        longLendDuration: type === "lend" && maximal_duration > 5 * 24,
        longBorrowDuration: type === "borrow" && minimal_duration > 5 * 24,
        shortBorrowMake: type === "borrow" && !takeormake && minimal_duration < 3 * 24,
        shortBorrowTake: type === "borrow" && takeormake && maximal_duration < 3 * 24,
        highAmount: valueamount > (type === 'lend' ? 0.1 : 100) && valueamount <= (type === 'lend' ? 1 : 10000),
        veryHighAmount: valueamount > (type === 'lend' ? 1 : 10000),
    };

    const activeWarnings = Object.keys(warnings).filter(key => warnings[key as keyof typeof warnings]);

    useEffect(() => {
        const allChecked = activeWarnings.length === 0 || activeWarnings.every(key => checks[key]);
        set_isvalid(allChecked);
    }, [checks, activeWarnings.length, set_isvalid]);
    
    const handleCheck = (key: string, checked: boolean) => setChecks(prev => ({ ...prev, [key]: checked }));

    const Warning = ({ id, text }: { id: string; text: React.ReactNode }) => (
        <div className="grid grid-cols-[1fr,auto] items-center gap-4 mt-2 p-3 border border-red-500/50">
            <p className="text-red-400" style={{textShadow: '0 0 4px #f00'}}>{text}</p>
            <input id={id} type="checkbox" className="w-6 h-6 accent-[#0f0] bg-transparent border-red-500 cursor-pointer" checked={!!checks[id]} onChange={(e) => handleCheck(id, e.target.checked)} />
        </div>
    );

    const amountThreshold1 = type === 'lend' ? 0.1 : 100;
    const amountThreshold2 = type === 'lend' ? 1 : 10000;

    return (
        <div className="flex flex-col gap-2">
            {warnings.lowYield && <Warning id="lowYield" text="Your lend yield is below 5% APR. Are you sure? Better APY may exist elsewhere." />}
            {warnings.highYield && <Warning id="highYield" text="Your borrow yield is above 30% APR. This is very high. Please confirm you understand the cost." />}
            {warnings.longLendDuration && <Warning id="longLendDuration" text="Maximal duration is over 5 days. You cannot withdraw your assets during this period. Acknowledge this lock-up." />}
            {warnings.longBorrowDuration && <Warning id="longBorrowDuration" text="Minimal duration is over 5 days. You CANNOT repay early to retrieve your collateral. Acknowledge this commitment." />}
            {warnings.shortBorrowMake && <Warning id="shortBorrowMake" text="Minimal duration is under 3 days. Your offer can be taken instantly, requiring you to repay very soon or face liquidation. This requires constant monitoring." />}
            {warnings.shortBorrowTake && <Warning id="shortBorrowTake" text="Maximal duration is under 3 days. You must repay your loan within this short period or you will be liquidated." />}
            {warnings.highAmount && <Warning id="highAmount" text={`You are creating an offer for over ${amountThreshold1} ${type === 'lend' ? 'ETH' : 'USD'}. Please double-check all parameters.`} />}
            {warnings.veryHighAmount && <Warning id="veryHighAmount" text={<>You are creating an offer for over {amountThreshold2} {type === 'lend' ? 'ETH' : 'USD'}. The protocol is experimental. I am not liable for any loss. For support, join our <a href="https://discord.gg/mN8gZUgFS7" target="_blank" className="underline">Discord</a>.</>} />}
        </div>
    );
};

export default SafetyBox;