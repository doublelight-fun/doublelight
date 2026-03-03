#!/bin/bash
# DoubleLight — Fix chain switch error handling
# cd ~/doublelight && bash fix-chain-switch.sh

python3 << 'PYEOF'
with open("src/app/hooks/useWallet.js", "r") as f:
    content = f.read()

# Replace the switchToRepublicChain function with better error handling
old_switch = '''  // Switch EVM wallet to Republic AI chain
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
  }, []);'''

new_switch = '''  // Switch EVM wallet to Republic AI chain
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
  }, [showToast]);'''

content = content.replace(old_switch, new_switch)

# Replace the useEffect that watches appKit connection — handle switch failure
old_effect = '''  // Watch AppKit connection state
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
  }, [appKitConnected, appKitAddress, switchToRepublicChain, fetchEvmBalance, showToast]);'''

new_effect = '''  // Watch AppKit connection state
  useEffect(() => {
    if (appKitConnected && appKitAddress) {
      setWallet({ address: appKitAddress, type: "evm" });

      (async () => {
        const switched = await switchToRepublicChain();
        if (switched) {
          const bal = await fetchEvmBalance(appKitAddress);
          setRaiBalance(bal);
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
  }, [appKitConnected, appKitAddress, switchToRepublicChain, fetchEvmBalance, showToast]);'''

content = content.replace(old_effect, new_effect)

# Also add "warn" type support — check if Toast component handles it
# The toast showToast uses "warn" now, but Toast.js only checks "error" vs other
# We need to update Toast.js too

with open("src/app/hooks/useWallet.js", "w") as f:
    f.write(content)

print("✅ useWallet.js patched — chain switch error handling added")

# Now patch Toast.js to support "warn" type
with open("src/app/components/Toast.js", "r") as f:
    toast_content = f.read()

old_toast = '''export default function Toast({ toast }) {
  if (!toast) return null;

  const isError = toast.type === "error";
  const color = isError ? "#ff5050" : "#00E5A0";
  const bg = isError ? "rgba(255,80,80,0.12)" : "rgba(0,229,160,0.12)";
  const border = isError ? "rgba(255,80,80,0.3)" : "rgba(0,229,160,0.3)";
  const icon = toast.type === "success" ? "\\u2713" : isError ? "\\u2717" : "\\u2139";'''

new_toast = '''export default function Toast({ toast }) {
  if (!toast) return null;

  const isError = toast.type === "error";
  const isWarn = toast.type === "warn";
  const color = isError ? "#ff5050" : isWarn ? "#FFD54F" : "#00E5A0";
  const bg = isError ? "rgba(255,80,80,0.12)" : isWarn ? "rgba(255,213,79,0.10)" : "rgba(0,229,160,0.12)";
  const border = isError ? "rgba(255,80,80,0.3)" : isWarn ? "rgba(255,213,79,0.25)" : "rgba(0,229,160,0.3)";
  const icon = toast.type === "success" ? "\\u2713" : isError ? "\\u2717" : isWarn ? "\\u26A0" : "\\u2139";'''

toast_content = toast_content.replace(old_toast, new_toast)

with open("src/app/components/Toast.js", "w") as f:
    f.write(toast_content)

print("✅ Toast.js patched — warn type support added")
PYEOF

echo ""
echo "✅ Done! Changes:"
echo "  - useWallet.js: chain switch now handles all error cases with user-friendly toasts"
echo "  - Toast.js: added 'warn' type (yellow color)"
echo ""
echo "Next:"
echo "  npx next build"
echo "  git add . && git commit -m 'fix: better error handling for chain switch failure' && git push origin main"
