export const themeConstant = {
    DARK: 'dark',
    LIGHT: 'light'
}

export const CONTRACT_ADDRESS = "0x009bf36356ead3a480e40309a7d63e055fa58d963d222cbcdf3a7bdfaa493982";

// Categories
export const ETH_CATEGORY  = "3618502788666131213697322783095070105623107215331596699973092056135872020480";
export const USDC_CATEGORY = "3618502788666131213697322783095070105623107215331596699973092056135872020479";
export const STRK_CATEGORY = "3618502788666131213697322783095070105623107215331596699973092056135872020478";



// ETH market
export const ETH_ADDRESS: string = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7".toLowerCase();
export const ETH_DECIMALS: number = 18;

export const FETH_ADDRESS: string = "0x030bbf27c4e9e698dfb5c8df4efe712985444603c7f721144416227bfd7c10c5".toLowerCase();
export const FETH_DECIMALS: number = 18;




// USDC market

// Regular assets
export const USDC_ADDRESS: string = "0x053C91253BC9682c04929cA02ED00b3E423f6710D2ee7e0D5EBB06F3eCF368A8".toLowerCase();
export const USDC_DECIMALS: number = 6;

export const USDT_ADDRESS: string = "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8";
export const USDT_DECIMALS: number = 6;

export const DAI_ADDRESS: string = "0x05574eb6b8789a91466f902c380d978e472db68170ff82a5b650b95a58ddf4ad";
export const DAI_DECIMALS: number = 18;

export const DAIV0_ADDRESS: string = "0x00da114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3";
export const DAIV0_DECIMALS: number = 18;

// Nimbora assets
export const NIMBORA_nsDAI_ADDRESS: string = "0x004380de5819e2e989b5e8b978ea2811fd36fdbc5c12fcfb3a2b444098888665";
export const NIMBORA_nsDAI_DECIMALS: number = 18;

export const NIMBORA_nstUSD_ADDRESS: string = "0x0405b7b5fb7353ec745d9ef7cf1634e54fd25c5e24d62241c177114a18c45910";
export const NIMBORA_nstUSD_DECIMALS: number = 6;



// STRK market - todo vérifier les décimals !!!
export const STRK_ADDRESS: string = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
export const STRK_DECIMALS: number = 18;

// Liquid stacking providers
// Nimbora
export const sSTRK_ADDRESS: string = "0x01f823d93f9b5a836a3a1a4cea64bfb5737db81270cd526201a82d7447691cf9";
export const sSTRK_DECIMALS: number = 18;
// Nostra
export const nstStrk_ADDRESS: string = "0x04619e9ce4109590219c5263787050726be63382148538f3f936c22aa87d2fc2";
export const nstStrk_DECIMALS: number = 18;
// Strk farm
// Todo
// Stakefarm_
// Todo


export const MIN_ETH_VALUE = 10**18 / 30000;

export const SCALE_LTV = 100;

export const SCALE_APY = 1000000;
export const VALUE_1PERCENT_APY = SCALE_APY / 100;
export const PLATFORM_FEE_APY = SCALE_APY / 100;

export const MIN_TIME_SPACING_FOR_OFFERS = 86400;
export const SECONDS_PER_YEAR = 31536000;





export const ETH_SEPOLIA: string = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
export const STRK_SEPOLIA: string = "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
export const USDC_SEPOLIA: string = "0x053C91253BC9682c04929cA02ED00b3E423f6710D2ee7e0D5EBB06F3eCF368A8";
