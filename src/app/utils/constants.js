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
  currencies: [{ coinDenom: "RAI", coinMinimalDenom: "arai", coinDecimals: 18 }],
  feeCurrencies: [{ coinDenom: "RAI", coinMinimalDenom: "arai", coinDecimals: 18 }],
  stakeCurrency: { coinDenom: "RAI", coinMinimalDenom: "arai", coinDecimals: 18 },
};
export const TOKEN_ADDRESSES = {
  WRAI: "0x64B5862c4F875BE29ef86423d44C38d4a536971A",
  USDC: "0x4056fbCc1B167deaeF2cAB801C2599BF97C69862",
  USDT: "0x57605eaaEe8708701d31dE3467F715c8646C9fB1",
  WETH: "0x4d8f700822086149863a848dccBa953924DAf51B",
  WBTC: "0x4F291E2CaE9428A96E32FfbA240e7B4a3948AA1F",
};
export const AMM_ADDRESS = "0x843dE781095d9436d4eA3c2fce76cd82fa49faC1";
export const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function faucet(uint256 amount) external",
];
export const AMM_ABI = [
  "function swap(address tokenIn, address tokenOut, uint256 amountIn) returns (uint256)",
  "function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) returns (uint256)",
  "function removeLiquidity(address tokenA, address tokenB, uint256 lpAmount) returns (uint256, uint256)",
  "function getAmountOut(address tokenIn, address tokenOut, uint256 amountIn) view returns (uint256)",
  "function getPoolInfo(address tokenA, address tokenB) view returns (uint256 reserveA, uint256 reserveB, uint256 totalLP, bool exists)",
  "function getUserLP(address tokenA, address tokenB, address user) view returns (uint256)",
];
export const DEFAULT_TOKENS = [
  { symbol: "RAI",  name: "Republic AI",  icon: "\u25C6", color: "#00E5A0", decimals: 18, address: null },
  { symbol: "WRAI", name: "Wrapped RAI",  icon: "\u25C7", color: "#00C489", decimals: 18, address: TOKEN_ADDRESSES.WRAI },
  { symbol: "USDC", name: "USD Coin",     icon: "\u25CE", color: "#2775CA", decimals: 6,  address: TOKEN_ADDRESSES.USDC },
  { symbol: "USDT", name: "Tether",       icon: "\u20AE", color: "#50AF95", decimals: 6,  address: TOKEN_ADDRESSES.USDT },
  { symbol: "WETH", name: "Wrapped ETH",  icon: "\u27E0", color: "#627EEA", decimals: 18, address: TOKEN_ADDRESSES.WETH },
  { symbol: "WBTC", name: "Wrapped BTC",  icon: "\u20BF", color: "#F7931A", decimals: 8,  address: TOKEN_ADDRESSES.WBTC },
];
export const TABS = ["swap", "liquidity", "stake", "compute", "shield"];
export const FOOTER_LINKS = [
  ["Republic AI Network", "https://republicai.io"],
  ["Points Portal", "https://points.republicai.io/?ref=071B43"],
  ["Docs", "https://github.com/doublelight-fun/doublelight"],
  ["X / Twitter", "https://x.com/2lightswap"],
];
