import { PLATFORM_FEE_APY, SCALE_APY, SECONDS_PER_YEAR } from "./constant";

export function formatDate(seconds: number): string {
    const date = new Date(Number(seconds) * 1000);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}
export function computeInterest(inputAmount: number, rate: number, duration: number) {
    return Number(
        Math.round(
        (Number(inputAmount) +
        (Number(inputAmount) *
            Number(rate) *
            duration
            /
            (SCALE_APY *
            SECONDS_PER_YEAR)))
        *100)/100)
}