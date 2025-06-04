import { sortByYield } from "./array";
import { MIN_ETH_VALUE, MIN_TIME_SPACING_FOR_OFFERS, PLATFORM_FEE_APY, SCALE_APY, SECONDS_PER_YEAR } from "./constant";

export function matchLend(offer: any, all_offers: any[]) {
    let all_borrow = sortByYield(all_offers[0], "borrow");
    let amount = BigInt(offer.amount);
    let answer = [];
    let average_rate = BigInt(0);
    for (let i = 0; i < all_borrow.length; i++) {
        if (Number(all_borrow[i].amount_available) < MIN_ETH_VALUE) {
            continue
        }
        console.log("Current amount      ", amount);
        // Check duration
        if (BigInt(Math.max(Number(all_borrow[i].price.minimal_duration), Number(offer.price.minimal_duration)))
            + BigInt(MIN_TIME_SPACING_FOR_OFFERS) <=
            BigInt(Math.min(Number(all_borrow[i].price.maximal_duration), Number(offer.price.maximal_duration)))) {
                // Compute the actual amount available based on max duration
                let max_duration = BigInt(Math.min(Number(all_borrow[i].price.maximal_duration), Number(offer.price.maximal_duration))).toString();
                let amount_available = BigInt(all_borrow[i].amount_available);
                console.log("amount_available    ", amount_available);
                let new_amount_available_ = amount_available -
                BigInt(Math.round((Number(amount_available) * Number(all_borrow[i].price.rate) * Number(max_duration)) /
                    (Number(SCALE_APY) * Number(SECONDS_PER_YEAR))).toString());
                // To be sure we don't take too much, we take off 1
                let new_amount_available = new_amount_available_ - BigInt(1);

                console.log("new_amount_available", new_amount_available);
                const newborrow = Object.assign({}, all_borrow[i]);
                newborrow.amount_available = new_amount_available;
                // Now we can accept this offer
                if (new_amount_available >= amount) {
                    answer.push([newborrow, Number(amount)]);
                    average_rate += amount * BigInt(newborrow.price.rate);
                    console.log("picked amount", amount);
                    amount = BigInt(0);
                    break;
                }
                else {
                    answer.push([newborrow, Number(new_amount_available)]);
                    average_rate += new_amount_available * BigInt(newborrow.price.rate);
                    amount -= new_amount_available;
                    console.log("picked amount", new_amount_available);
                }
        }
    }
    console.log("Current amount", amount);
    if (amount > BigInt(0)) {
        return [[], ""];
    }
    return [answer, Number(average_rate) / Number(offer.amount)];
}

export function matchBorrow(offer: any, all_offers: any[]) {
    let all_lend = sortByYield(all_offers[0], "lend");
    let amount = BigInt(offer.amount);
    let answer = [];
    let average_rate = BigInt(0);
    for (let i = 0; i < all_lend.length; i++) {
        console.log("Current amount      ", amount);
        // Check duration
        if (BigInt(Math.max(Number(all_lend[i].price.minimal_duration), Number(offer.price.minimal_duration)))
            + BigInt(MIN_TIME_SPACING_FOR_OFFERS) <=
            BigInt(Math.round(3600 * Math.min(Number(all_lend[i].price.maximal_duration), Number(offer.price.maximal_duration))))) {
                // Compute the actual amount available based on max duration
                let max_duration = BigInt(Math.round(Math.min(Number(all_lend[i].price.maximal_duration), 3600 * Number(offer.price.maximal_duration)))).toString();
                let amount_available = BigInt(all_lend[i].amount_available);
                console.log("amount_available    ", amount_available);
                let new_amount_available_ = amount_available -
                BigInt(Math.round((Number(amount_available) * Number(all_lend[i].price.rate) * Number(max_duration)) /
                    (Number(SCALE_APY) * Number(SECONDS_PER_YEAR))).toString());
                let new_amount_available = BigInt(Math.round(Number(new_amount_available_ - BigInt(1))));
                console.log("new_amount_available", new_amount_available);
                const newlend = Object.assign({}, all_lend[i]);
                newlend.amount_available = new_amount_available;
                // Now we can accept this offer
                if (new_amount_available >= amount) {
                    answer.push([newlend, Number(amount)]);
                    average_rate += amount * BigInt(newlend.price.rate);
                    console.log("picked amount", amount);
                    amount = BigInt(0);
                    break;
                }
                else {
                    answer.push([newlend, Number(new_amount_available)]);
                    average_rate += new_amount_available * BigInt(newlend.price.rate);
                    amount -= new_amount_available;
                    console.log("picked amount", new_amount_available);
                }
        }
    }
    console.log("Current amount", amount);
    if (amount > BigInt(0)) {
        return [[], ""];
    }
    return [answer, Number(average_rate) / Number(offer.amount)];
}