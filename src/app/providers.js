"use client";
import { createAppKit } from "@reown/appkit/react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

const republicAI = {
  id: 77701,
  name: "Republic AI Testnet",
  nativeCurrency: { name: "RAI", symbol: "RAI", decimals: 18 },
  rpcUrls: { default: { http: ["https://evm-rpc.republicai.io"] } },
};

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [republicAI],
});

createAppKit({
  adapters: [wagmiAdapter],
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

const queryClient = new QueryClient();

export function Web3Provider({ children }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
