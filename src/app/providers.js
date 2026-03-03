"use client";
import { createAppKit } from "@reown/appkit/react";

const republicAI = {
  id: 77701,
  name: "Republic AI Testnet",
  nativeCurrency: { name: "RAI", symbol: "RAI", decimals: 18 },
  rpcUrls: { default: { http: ["https://evm-rpc.republicai.io"] } },
};

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;

createAppKit({
  projectId,
  networks: [republicAI],
  metadata: {
    name: "DoubleLight",
    description: "Privacy DEX on Republic AI",
    url: "https://doublelight.fun",
    icons: ["https://doublelight.fun/favicon.ico"],
  },
  themeMode: "dark",
});

export function Web3Provider({ children }) {
  return <>{children}</>;
}
