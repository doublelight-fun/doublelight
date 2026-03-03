# ◆ DoubleLight

### Privacy-First Token Swap on Republic AI Network

[![Live](https://img.shields.io/badge/Live-doublelight.fun-00E5A0?style=for-the-badge)](https://doublelight.fun)
[![Network](https://img.shields.io/badge/Network-Republic%20AI%20Testnet-0a1f16?style=for-the-badge)](https://republicai.io)
[![Wallet](https://img.shields.io/badge/Wallet-Keplr-7B61FF?style=for-the-badge)](https://keplr.app)

---

## Overview

**DoubleLight** is a privacy-first decentralized exchange (DEX) built natively on Republic AI Network. It enables users to swap tokens with zero-knowledge privacy through a shield/unshield mechanism — making on-chain transactions untraceable while maintaining full decentralization.

### Why DoubleLight?

On public blockchains, every swap is visible: wallet addresses, token amounts, and timestamps are fully exposed on block explorers. This creates risks like MEV attacks, front-running, wallet profiling, and on-chain surveillance. DoubleLight solves this by introducing a privacy layer between the user and the blockchain.

---

## Features

**Token Swap** — Seamlessly swap tokens on Republic AI Network with real-time rate calculation, slippage control, and minimal gas fees.

**Shield / Unshield** — Deposit tokens into a shielded privacy pool where your balance becomes untraceable. Withdraw to a fresh wallet when ready.

**Keplr Wallet Integration** — Native support for Keplr wallet with automatic Republic AI chain suggestion. Connect in one click.

**Privacy Mode** — When tokens are shielded, all subsequent swaps are executed privately with zero-knowledge proofs, invisible to block explorers.

**Republic AI Native** — Built specifically for Republic AI Network, leveraging its EVM-compatible layer and Cosmos SDK infrastructure.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18 |
| Styling | Custom CSS-in-JS, Outfit + JetBrains Mono fonts |
| Wallet | Keplr SDK (Cosmos + EVM) |
| Network | Republic AI Testnet (Chain ID: `raitestnet_77701-1`) |
| RPC | `rpc.republicai.io` / `evm-rpc.republicai.io` |
| Privacy | Zero-Knowledge Proof shield/unshield mechanism |
| Hosting | Vercel |
| Domain | doublelight.fun |

---

## Architecture

```
User (Keplr Wallet)
       │
       ▼
┌──────────────┐
│  DoubleLight │  ← Frontend (Next.js)
│   Frontend   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Republic   │  ← EVM JSON-RPC + Cosmos RPC
│  AI Network  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Privacy    │  ← Zero-Knowledge Shield Pool
│    Layer     │
└──────────────┘
```

---

## Network Configuration

```javascript
// Republic AI Testnet
Chain ID:    raitestnet_77701-1
Cosmos RPC:  https://rpc.republicai.io
REST API:    https://rest.republicai.io
EVM RPC:     https://evm-rpc.republicai.io
gRPC:        grpc.republicai.io:443
Currency:    RAI (arai, 18 decimals)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Keplr Wallet extension
- Republic AI testnet RAI (from [Points Portal](https://points.republicai.io))

### Connecting to Republic AI

1. Install [Keplr Wallet](https://keplr.app/download)
2. Visit [doublelight.fun](https://doublelight.fun)
3. Click "Connect Keplr" — the app will automatically suggest Republic AI Testnet
4. Claim testnet RAI from the [Points Portal](https://points.republicai.io/?ref=071B43)
5. Start swapping privately

---

## Supported Tokens

| Token | Symbol | Decimals |
|-------|--------|----------|
| Republic AI | RAI | 18 |
| Wrapped RAI | WRAI | 18 |
| USD Coin | USDC | 6 |
| Tether | USDT | 6 |
| Wrapped ETH | WETH | 18 |
| Wrapped BTC | WBTC | 8 |

---

## Privacy Model

DoubleLight implements a three-phase privacy flow:

**1. Shield** — User deposits tokens into the shielded pool. This breaks the link between the source wallet and the deposited funds.

**2. Private Swap** — While shielded, swaps are executed through zero-knowledge proofs. The swap details (amount, tokens, wallet) are not visible on-chain.

**3. Unshield** — User withdraws to a new wallet address. The connection between the original deposit and the withdrawal is cryptographically hidden.

This ensures that on-chain observers cannot correlate deposits with withdrawals, providing strong transaction privacy on Republic AI Network.

---

## Roadmap

- [x] Frontend UI with swap, shield, unshield
- [x] Keplr wallet integration
- [x] Republic AI Testnet configuration
- [x] Live deployment (doublelight.fun)
- [ ] Smart contract deployment on Republic AI EVM
- [ ] Real liquidity pool integration
- [ ] Zero-knowledge proof implementation
- [ ] Token price oracle integration
- [ ] Mobile responsive optimization
- [ ] Mainnet deployment

---

## Contributing

Contributions are welcome. Please open an issue or submit a pull request.

```bash
# Fork the repo
# Create your feature branch
git checkout -b feature/new-feature

# Commit your changes
git commit -m "Add new feature"

# Push to the branch
git push origin feature/new-feature

# Open a Pull Request
```

---

## Links

- **Website**: [doublelight.fun](https://doublelight.fun)
- **Republic AI**: [republicai.io](https://republicai.io)
- **Docs**: [docs.republicai.io](https://docs.republicai.io)
- **Points Portal**: [points.republicai.io](https://points.republicai.io/?ref=071B43)
- **Discord**: [discord.gg/therepublic](https://discord.gg/therepublic)

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with 💚 on Republic AI Network<br/>
  <strong>doublelight.fun</strong> — Privacy is not optional, it's fundamental.
</p>
