import { SCALE_APY } from "./constant";

export function formatTime(hours: number): string {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    let formattedTime = "";
    if (years > 0) {
        formattedTime += `${years} year${years > 1 ? "s" : ""}`;
    }
    if (remainingMonths > 0) {
        formattedTime += ` ${remainingMonths} month${remainingMonths > 1 ? "s" : ""}`;
    }
    if (remainingDays > 0) {
        formattedTime += ` ${remainingDays} day${remainingDays > 1 ? "s" : ""}`;
    }
    if (remainingHours > 0) {
        formattedTime += ` ${remainingHours} hour${remainingHours > 1 ? "s" : ""}`;
    }
    if (formattedTime === "") {
        formattedTime = "< 1 hour";
    }
    return formattedTime.trim();
}

export function formatDate(seconds: number): string {
    const date = new Date(Number(seconds) * 1000);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}
export function currentTime(): string {
    const date = new Date();
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

export function formatCurrency(currency: number, scale = 10000) {
    let amount = Number(currency) / 1e18;
    amount = Math.round(amount * scale) / scale;
    return amount;
}

export function formatCollateral(currency: number, decimals: number) {
    let amount = Number(currency) / 10 ** decimals;
    amount = Math.round(amount * 100) / 100;
    return amount;
}

export function formatYield(yieldValue: number) {
    return Math.round(100 * 100 * Number(yieldValue) / SCALE_APY) / 100;
}