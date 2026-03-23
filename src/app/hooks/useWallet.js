"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAppKit, useAppKitAccount, useDisconnect } from "@reown/appkit/react";
import { REPUBLIC_CHAIN } from "../utils/constants";

export function useWallet() {
  const { open: openAppKit } = useAppKit();
  const { address: appKitAddress, isConnected: appKitConnected } = useAppKitAccount();
  const { disconnect: appKitDisconnect } = useDisconnect();

  const [wallet, setWallet] = useState(null);
  const [raiBalance, setRaiBalance] = useState("0.00");
  const [tokenBalances, setTokenBalances] = useState({});
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [showWalletPicker, setShowWalletPicker] = useState(false);
  const [toast, setToast] = useState(null);

  const walletMenuRef = useRef(null);

  // Toast helper
  const showToast = useCallback((type, msg, duration = 3000) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), duration);
  }, []);

  // Fetch RAI balance via Cosmos REST
  const fetchCosmosBalance = useCallback(async (addr) => {
    try {
      const res = await fetch(
        "https://api-republic.onenov.xyz/cosmos/bank/v1beta1/balances/" + addr
      );
      const data = await res.json();
      const raiBal = data.balances?.find((b) => b.denom === "arai");
      if (raiBal) {
        return (parseFloat(raiBal.amount) / 1e18).toFixed(4);
      }
    } catch (e) {
      console.log("Cosmos balance fetch error:", e);
    }
    return "0.00";
  }, []);

  // Fetch RAI balance via EVM RPC
  const fetchEvmBalance = useCallback(async (addr) => {
    try {
      const rpcUrl = "https://evm-rpc.republicai.io";
    const res = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getBalance",
          params: [addr, "latest"],
          id: 1,
        }),
      });
      const data = await res.json();
      return (parseInt(data.result, 16) / 1e18).toFixed(4);
    } catch (e) {
      console.log("EVM balance fetch error:", e);
    }
    return "0.00";
  }, []);

  // Switch EVM wallet to Republic AI chain
  const switchToRepublicChain = useCallback(async () => {
    if (!window.ethereum) {
      showToast("warn", "No wallet provider detected. Please add Republic AI Testnet manually (Chain ID: 77701, RPC: evm-rpc.republicai.io)", 6000);
      return false;
    }
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: REPUBLIC_CHAIN.evmChainIdHex }],
      });
      return true;
    } catch (switchErr) {
      if (switchErr.code === 4902) {
        // Chain not added yet — try adding it
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: REPUBLIC_CHAIN.evmChainIdHex,
                chainName: REPUBLIC_CHAIN.chainName,
                nativeCurrency: { name: "RAI", symbol: "RAI", decimals: 18 },
                rpcUrls: [REPUBLIC_CHAIN.evmRpc],
              },
            ],
          });
          return true;
        } catch (addErr) {
          console.error("Failed to add Republic AI chain:", addErr);
          showToast("error", "Could not add Republic AI Testnet. Please add it manually in your wallet — Chain ID: 77701, RPC: evm-rpc.republicai.io", 8000);
          return false;
        }
      } else if (switchErr.code === 4001) {
        // User rejected the switch
        showToast("warn", "Chain switch rejected. Please switch to Republic AI Testnet manually.", 5000);
        return false;
      } else {
        // Other errors (e.g. wallet doesn't support method)
        console.error("Chain switch error:", switchErr);
        showToast("error", "Could not switch network. Please add Republic AI Testnet manually — Chain ID: 77701, RPC: evm-rpc.republicai.io", 8000);
        return false;
      }
    }
  }, [showToast]);

  // Fetch ERC-20 token balances
  const fetchTokenBalances = useCallback(async (addr) => {
    if (!addr) return;
    try {
      const { ethers } = await import("ethers");
      const provider = new ethers.JsonRpcProvider("https://evm-rpc.republicai.io");
      const tokens = {
        WRAI: { address: "0x64B5862c4F875BE29ef86423d44C38d4a536971A", decimals: 18 },
        USDC: { address: "0x4056fbCc1B167deaeF2cAB801C2599BF97C69862", decimals: 6 },
        USDT: { address: "0x57605eaaEe8708701d31dE3467F715c8646C9fB1", decimals: 6 },
        WETH: { address: "0x4d8f700822086149863a848dccBa953924DAf51B", decimals: 18 },
        WBTC: { address: "0x4F291E2CaE9428A96E32FfbA240e7B4a3948AA1F", decimals: 8 },
      };
      const abi = ["function balanceOf(address) view returns (uint256)"];
      const balances = {};
      for (const [symbol, info] of Object.entries(tokens)) {
        try {
          const contract = new ethers.Contract(info.address, abi, provider);
          const bal = await contract.balanceOf(addr);
          balances[symbol] = ethers.formatUnits(bal, info.decimals);
        } catch { balances[symbol] = "0.00"; }
      }
      setTokenBalances(balances);
    } catch (err) { console.error("Token balance fetch error:", err); }
  }, []);

    // Connect via Keplr (Cosmos native)
  const connectKeplr = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (!window.keplr) {
      showToast("error", "Keplr wallet not found. Please install the Keplr extension.", 4000);
      window.open("https://www.keplr.app/download", "_blank");
      return;
    }
    try {
      try {
        await window.keplr.experimentalSuggestChain({
          chainId: REPUBLIC_CHAIN.chainId,
          chainName: REPUBLIC_CHAIN.chainName,
          rpc: REPUBLIC_CHAIN.rpc,
          rest: REPUBLIC_CHAIN.rest,
          bip44: REPUBLIC_CHAIN.bip44,
          bech32Config: REPUBLIC_CHAIN.bech32Config,
          currencies: REPUBLIC_CHAIN.currencies,
          feeCurrencies: REPUBLIC_CHAIN.feeCurrencies,
          stakeCurrency: REPUBLIC_CHAIN.stakeCurrency,
          coinType: 60,
          features: ["eth-address-gen", "eth-key-sign"],
        });
      } catch (e) {
        console.log("Chain suggestion failed, trying enable directly:", e);
      }

      await window.keplr.enable(REPUBLIC_CHAIN.chainId);
      const signer = window.keplr.getOfflineSigner(REPUBLIC_CHAIN.chainId);
      const accounts = await signer.getAccounts();

      if (accounts?.length > 0) {
        const addr = accounts[0].address;
        setWallet({ address: addr, type: "keplr" });
        const bal = await fetchCosmosBalance(addr);
        setRaiBalance(bal);
        showToast("success", "Connected to Republic AI Testnet");
      }
    } catch (err) {
      console.error("Keplr connect error:", err);
      showToast("error", "Failed to connect. Check Keplr and try again.", 4000);
    }
  }, [fetchCosmosBalance, showToast]);

  // Connect via EVM (Reown AppKit)
  const connectEVM = useCallback(() => {
    openAppKit();
  }, [openAppKit]);

  // Watch AppKit connection state
  useEffect(() => {
    if (appKitConnected && appKitAddress) {
      setWallet({ address: appKitAddress, type: "evm" });

      (async () => {
        const switched = await switchToRepublicChain();
        if (switched) {
          const bal = await fetchEvmBalance(appKitAddress);
          setRaiBalance(bal);
          fetchTokenBalances(appKitAddress);
          showToast("success", "Connected to Republic AI Testnet via EVM Wallet");
        } else {
          // Still connected but on wrong chain — try fetching balance anyway
          try {
            const bal = await fetchEvmBalance(appKitAddress);
            setRaiBalance(bal);
          } catch (e) {
            console.log("Balance fetch on wrong chain:", e);
          }
          showToast("warn", "Connected but not on Republic AI Testnet. Switch network in your wallet.", 6000);
        }
      })();
    }
  }, [appKitConnected, appKitAddress, switchToRepublicChain, fetchEvmBalance, showToast]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (appKitConnected) appKitDisconnect();
    setWallet(null);
    setRaiBalance("0.00");
    setShowWalletMenu(false);
    showToast("info", "Wallet disconnected", 2500);
  }, [appKitConnected, appKitDisconnect, showToast]);

  // Close wallet menu on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (walletMenuRef.current && !walletMenuRef.current.contains(e.target)) {
        setShowWalletMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const refreshAll = useCallback(async () => {
    if (!wallet?.address) return;
    try {
      if (wallet.type === "evm") {
        const bal = await fetchEvmBalance(wallet.address);
        setRaiBalance(bal);
      } else {
        const bal = await fetchCosmosBalance(wallet.address);
        setRaiBalance(bal);
      }
      await fetchTokenBalances(wallet.address);
    } catch (err) { console.error("Refresh error:", err); }
  }, [wallet, fetchEvmBalance, fetchCosmosBalance, fetchTokenBalances]);

  return {
    wallet,
    raiBalance,
    tokenBalances,
    fetchTokenBalances,
    refreshAll,
    toast,
    showWalletMenu,
    setShowWalletMenu,
    showWalletPicker,
    setShowWalletPicker,
    walletMenuRef,
    connectKeplr,
    connectEVM,
    disconnect,
  };
}
