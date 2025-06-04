export function sortByYield(array: any[], order: "lend" | "borrow"): any[] {
  return array.sort((a, b) => {
    if (order === "lend") {
      return Number(a.price.rate) - Number(b.price.rate);
    }
    return Number(b.price.rate) - Number(a.price.rate);
  }).filter((offer) => offer.is_active);
}