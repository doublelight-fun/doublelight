<p align="center">
  <img src="https://img.shields.io/badge/version-v0.3.0--testnet-00E5A0?style=flat-square&labelColor=040907" />
  <img src="https://img.shields.io/badge/network-Republic%20AI%20Testnet-00E5A0?style=flat-square&labelColor=040907" />
  <img src="https://img.shields.io/badge/status-live-00E5A0?style=flat-square&labelColor=040907" />
  <img src="https://img.shields.io/badge/contracts-8%20deployed-00E5A0?style=flat-square&labelColor=040907" />
  <img src="https://img.shields.io/badge/license-MIT-2a5c47?style=flat-square&labelColor=040907" />
</p>

<h1 align="center">
  <br>
  DoubleLight
  <br>
  <sub>AI-Powered DeFi Hub on Republic AI</sub>
</h1>

<p align="center">
  <strong>DeFi infrastructure for the AI economy — swap tokens, provide liquidity, fund compute miners, run inference, and preserve privacy.</strong>
</p>

<p align="center">
  <a href="https://doublelight.fun">Live Demo</a> •
  <a href="#features">Features</a> •
  <a href="#smart-contracts">Smart Contracts</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#roadmap">Roadmap</a> •
  <a href="https://x.com/2lightswap">Twitter</a>
</p>

---

## Overview

DoubleLight is a DeFi hub built natively on [Republic AI Network](https://republicai.io), designed to finance and accelerate AI compute on the network. It goes beyond basic token swapping — providing an AMM DEX with real on-chain liquidity, miner staking pools, an AI compute marketplace, and a ZK privacy layer.

Built in response to Republic AI's vision for **DeFi primitives that serve the AI ecosystem** — financing miners scaling GPU infrastructure and AI projects growing on the network.

---

## Smart Contracts

All contracts are deployed and verified on **Republic AI Testnet (Chain ID: 77701)**.

### Core Protocol

| Contract | Address | Description |
|----------|---------|-------------|
| DoubleLightAMM | `0x843dE781095d9436d4eA3c2fce76cd82fa49faC1` | AMM DEX — constant product (x*y=k), 0.3% swap fee |
| DoubleLight | `0x5Fc8E83B3D92ABe3a63626f799370AA07C4F288F` | Core protocol contract |

### ERC-20 Tokens

| Token | Symbol | Address | Decimals | Initial Supply |
|-------|--------|---------|----------|---------------|
| Wrapped RAI | WRAI | `0x64B5862c4F875BE29ef86423d44C38d4a536971A` | 18 | 1,000,000 (old) |
| USD Coin | USDC | `0x4056fbCc1B167deaeF2cAB801C2599BF97C69862` | 6 | 10,000,000 |
| Tether USD | USDT | `0x57605eaaEe8708701d31dE3467F715c8646C9fB1` | 6 | 10,000,000 |
| Wrapped Ether | WETH | `0x4d8f700822086149863a848dccBa953924DAf51B` | 18 | 5,000 |
| Wrapped Bitcoin | WBTC | `0x4F291E2CaE9428A96E32FfbA240e7B4a3948AA1F` | 8 | 100 |

All tokens include a public `faucet()` function for testnet usage.

### Liquidity Pools (Seeded)

| Pool | Reserves |
|------|----------|
| WRAI/USDC | 50,000 WRAI + 122,500 USDC |
| WRAI/USDT | 50,000 WRAI + 122,500 USDT |
| WRAI/WETH | 50,000 WRAI + 50 WETH |
| WRAI/WBTC | 50,000 WRAI + 3.33 WBTC |
| USDC/USDT | 500,000 USDC + 500,000 USDT |

---

## Features

### Swap (Real On-Chain)
Token exchange powered by the DoubleLightAMM contract. Quotes fetched directly from on-chain reserves using `getAmountOut()`. Swaps execute via `approve() → swap()` with real token transfers. AI Risk Analysis scores every trade before execution.

### Liquidity
Add or remove liquidity from any pool. Liquidity providers earn 0.3% fee on every swap proportional to their pool share. Select from 5 active pools, deposit token pairs, receive LP tokens.

### Stake — Miner Financing Pools
Stake RAI to fund compute miners on Republic AI. Miners use pooled capital to scale GPU clusters and inference nodes. Stakers earn yield from compute fees. Three risk tiers: LOW (24.5% APY), MEDIUM (31.2% APY), HIGH (42.8% APY).

### Compute — AI Inference Marketplace
Run AI inference directly from the browser. Select a model, input a prompt, pay per request in RAI. Results include latency, cost, and an on-chain verifiable transaction hash.

| Model | Type | Cost | Status |
|-------|------|------|--------|
| Republic LLM 7B | Text Generation | 0.002 RAI | Live |
| DL-Risk-v0.1 | Swap Risk Analysis | 0.001 RAI | Live |
| PriceSeer-v1 | Price Prediction | 0.003 RAI | Soon |
| GuardNet-v1 | Fraud Detection | 0.002 RAI | Soon |

### Privacy — Shield / Unshield
ZK privacy layer for Republic AI. Shield tokens into a privacy pool to make balances untraceable. Unshield to withdraw to a public address. (In progress — pending ZK framework integration.)

### Dual Wallet Support
Connect with **Keplr** (Cosmos native `rai1...`) or any **EVM wallet** (MetaMask, Rabby, WalletConnect) via Reown AppKit. Auto chain switch to Republic AI Testnet. Real-time RAI balance from both Cosmos REST and EVM RPC.

---

## Architecture

```
src/app/
├── components/
│   ├── AIRiskPanel.js      # AI risk scoring engine
│   ├── ComputePanel.js     # AI compute marketplace
│   ├── LiquidityPanel.js   # Add/remove liquidity UI
│   ├── StakePanel.js       # Miner staking pools
│   ├── Header.js           # Navbar, wallet, network status
│   ├── NeuralMesh.js       # Animated canvas background
│   ├── TokenInput.js       # Token amount input + selector
│   ├── TokenModal.js       # Token picker modal
│   ├── WalletPicker.js     # Keplr / EVM wallet choice
│   ├── SwapInfo.js         # Rate, slippage, gas info
│   └── Toast.js            # Notifications
├── hooks/
│   └── useWallet.js        # Wallet connect, balance, disconnect
├── utils/
│   ├── bech32.js           # Address conversion (EVM ↔ Cosmos)
│   └── constants.js        # Chain config, tokens, ABIs, contracts
├── page.js                 # Main orchestrator
├── providers.js            # Reown AppKit config
└── layout.js               # Root layout
```

### Tech Stack

- **Framework:** Next.js 16 + React 18
- **Smart Contracts:** Solidity 0.8.20, Hardhat
- **Wallet:** Reown AppKit + EthersAdapter (EVM), Keplr (Cosmos)
- **On-chain:** ethers.js v6 for contract interaction
- **Network:** Republic AI Testnet (Chain ID: 77701)
- **Deployment:** Vercel (auto-deploy on push)

---

## Getting Started

### Prerequisites

- Node.js 18+
- Reown Project ID ([cloud.reown.com](https://cloud.reown.com))

### Setup

```bash
git clone https://github.com/doublelight-fun/doublelight.git
cd doublelight
npm install
```

Create `.env.local`:

```
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id
```

### Development

```bash
npm run dev
```

### Build & Deploy

```bash
npx next build
git add -A && git commit -m "your message" && git push origin main
# Vercel auto-deploys on push to main
```

### Contract Development

```bash
cd ~/doublelight-contracts
npx hardhat compile
node scripts/deploy-tokens.cjs    # Deploy ERC-20 tokens
node scripts/deploy-amm.cjs       # Deploy AMM + seed liquidity
```

---

## Network Configuration

| Parameter | Value |
|-----------|-------|
| Chain Name | Republic AI Testnet |
| Chain ID (EVM) | 77701 (0x12F85) |
| Chain ID (Cosmos) | raitestnet_77701-1 |
| EVM RPC | https://evm-rpc.republicai.io |
| Cosmos RPC | https://rpc.republicai.io |
| REST API | https://rest.republicai.io |
| Currency | RAI (18 decimals) |

---

## Roadmap

- [x] Token swap UI with dual wallet support
- [x] AI Risk Analysis engine (DL-Risk-v0.1)
- [x] Miner Staking Pools
- [x] AI Compute Marketplace
- [x] Privacy tab (Shield/Unshield UI)
- [x] Auto chain switch + error handling
- [x] Deploy 5 ERC-20 tokens (WRAI, USDC, USDT, WETH, WBTC)
- [x] Deploy AMM contract (DoubleLightAMM)
- [x] Seed 5 liquidity pools
- [x] Real on-chain swap via AMM
- [x] Liquidity tab (add/remove)
- [x] WRAI Wrapper contract (RAI ↔ WRAI)
- [x] Auto wrap/unwrap in swap flow
- [ ] Connect Hyperscale Compute for real inference
- [ ] AI price prediction model (PriceSeer-v1)
- [ ] Fraud detection model (GuardNet-v1)
- [ ] ZK privacy layer implementation
- [ ] Cross-chain bridge (IBC)
- [ ] Mainnet deployment

---

## Links

- **Live:** [doublelight.fun](https://doublelight.fun)
- **Twitter:** [x.com/2lightswap](https://x.com/2lightswap)
- **Republic AI:** [republicai.io](https://republicai.io)
- **Points Portal:** [points.republicai.io](https://points.republicai.io/?ref=071B43)

---

## License

MIT

---

<p align="center">
  <sub>Built with purpose on Republic AI Network</sub>
</p>
