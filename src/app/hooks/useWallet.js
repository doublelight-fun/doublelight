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
        REPUBLIC_CHAIN.rest + "/cosmos/bank/v1beta1/balances/" + addr
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
      const res = await fetch(REPUBLIC_CHAIN.evmRpc, {
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
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: REPUBLIC_CHAIN.evmChainIdHex }],
      });
    } catch (switchErr) {
      if (switchErr.code === 4902) {
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
      }
    }
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
        await switchToRepublicChain();
        const bal = await fetchEvmBalance(appKitAddress);
        setRaiBalance(bal);
      })();

      showToast("success", "Connected via EVM Wallet");
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

  return {
    wallet,
    raiBalance,
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
