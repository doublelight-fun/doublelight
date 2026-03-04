// Republic AI Network configuration
export const REPUBLIC_CHAIN = {
  chainId: "raitestnet_77701-1",
  chainName: "Republic AI Testnet",
  rpc: "https://rpc.republicai.io",
  rest: "https://rest.republicai.io",
  evmRpc: "https://evm-rpc.republicai.io",
  grpc: "grpc.republicai.io:443",
  evmChainIdHex: "0x12F85",
  pointsPortal: "https://points.republicai.io/?ref=071B43",
  bip44: { coinType: 60 },
  bech32Config: {
    bech32PrefixAccAddr: "rai",
    bech32PrefixAccPub: "raipub",
    bech32PrefixValAddr: "raivaloper",
    bech32PrefixValPub: "raivaloperpub",
    bech32PrefixConsAddr: "raivalcons",
    bech32PrefixConsPub: "raivalconspub",
  },
  currencies: [
    { coinDenom: "RAI", coinMinimalDenom: "arai", coinDecimals: 18 },
  ],
  feeCurrencies: [
    { coinDenom: "RAI", coinMinimalDenom: "arai", coinDecimals: 18 },
  ],
  stakeCurrency: {
    coinDenom: "RAI",
    coinMinimalDenom: "arai",
    coinDecimals: 18,
  },
};

// Default token list
export const DEFAULT_TOKENS = [
  { symbol: "RAI",  name: "Republic AI",  icon: "\u25C6", color: "#00E5A0", decimals: 18 },
  { symbol: "WRAI", name: "Wrapped RAI",  icon: "\u25C7", color: "#00C489", decimals: 18 },
  { symbol: "USDC", name: "USD Coin",     icon: "\u25CE", color: "#2775CA", decimals: 6 },
  { symbol: "USDT", name: "Tether",       icon: "\u20AE", color: "#50AF95", decimals: 6 },
  { symbol: "WETH", name: "Wrapped ETH",  icon: "\u27E0", color: "#627EEA", decimals: 18 },
  { symbol: "WBTC", name: "Wrapped BTC",  icon: "\u20BF", color: "#F7931A", decimals: 8 },
];

export const TABS = ["swap", "stake", "compute", "shield"];

export const FOOTER_LINKS = [
  ["Republic AI Network", "https://republicai.io"],
  ["Points Portal", "https://points.republicai.io/?ref=071B43"],
  ["Docs", "https://docs.republicai.io"],
  ["Keplr Wallet", "https://www.keplr.app"],
];
