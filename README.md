# 🦞 X1 Vault Memory

**Decentralized, encrypted memory backup for OpenClaw AI agents — powered by X1 blockchain and IPFS.**

---

## What Is This?

An OpenClaw skill that backs up your AI agent's identity and memory files to IPFS with encrypted storage and on-chain CID references on the X1 blockchain.

Your agent's brain — personality, knowledge, memories — encrypted with your wallet key, stored on decentralized infrastructure, and recoverable from anywhere.

**No more losing your agent when a server dies.**

---

## How It Works
```
Agent Files → tar.gz → Encrypt (NaCl) → Upload (IPFS/Pinata) → Record CID (X1 Blockchain)
```

1. **Bundle** — Compresses agent files (IDENTITY.md, SOUL.md, USER.md, TOOLS.md, memory/) into a tar.gz
2. **Encrypt** — Encrypts the archive with your wallet's secret key using NaCl secretbox
3. **Upload** — Pushes the encrypted blob to IPFS via Pinata's API
4. **Record** — Stores the IPFS CID as a transaction on the X1 blockchain
5. **Track** — Logs the CID and timestamp to vault-log.json

Only your wallet keypair can decrypt. Even if someone finds the CID, your data stays private.

---

## Requirements

| Requirement | Details |
|-------------|---------|
| **Node.js** | v18+ |
| **Pinata Account** | Free at [app.pinata.cloud](https://app.pinata.cloud) |
| **Solana/X1 Wallet** | Keypair JSON file |
| **X1 Tokens** | Testnet or mainnet XN for transaction fees |
| **OpenClaw** | Running instance with workspace access |

---

## Installation
```bash
cd /path/to/openclaw/workspace
git clone https://github.com/Lokoweb3/x1-vault-memory.git
cd x1-vault-memory
npm install
```

---

## Setup

### 0. Configure for X1 Testnet

X1 is SVM-compatible, so it uses Solana CLI tools. Set your CLI to X1 testnet:

````bash
# Install Solana CLI if you dont have it
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"

# Set to X1 testnet
solana config set --url https://rpc.testnet.x1.xyz
```


### 1. Set Environment Variables
```bash
export PINATA_JWT="your_pinata_jwt_here"
export X1_RPC_URL="https://rpc.testnet.x1.xyz"
```

### 2. Create a Wallet Keypair
```bash
solana-keygen new --outfile wallet.json --no-bip39-passphrase
```

> ⚠️ **Keep wallet.json safe. Never commit it to GitHub. This is your encryption key.**

### 3. Fund Your Wallet

**Testnet:**
```bash
solana airdrop 1 --url https://rpc.testnet.x1.xyz --keypair wallet.json
```

Or use a faucet:
- [faucet.x1.wiki](https://faucet.x1.wiki) (recommended)
- [faucet.testnet.x1.xyz](https://faucet.testnet.x1.xyz)

**Mainnet:** Transfer XN tokens to your wallet address.

---

## Usage

### Backup
```bash
node x1-vault-memory/src/backup.js
```

Output:
```
Backup uploaded, CID: QmExampleCID123456789abcdefghijklmnopqrstuv
Logged backup CID to vault-log.json
```

### Restore
```bash
node x1-vault-memory/src/restore.js <CID>
```

### Shell Wrappers
```bash
bash x1-vault-memory/scripts/backup.sh
bash x1-vault-memory/scripts/restore.sh <CID>
```

---

## CID Tracking

Every backup is logged to vault-log.json:
```json
[
  {
    "timestamp": "2026-02-16T09:48:38.207Z",
    "cid": "QmExampleCID123456789abcdefghijklmnopqrstuv"
  }
]
```

CIDs are also recorded on-chain. Check your wallet's transaction history on the [X1 Explorer](https://explorer.mainnet.x1.xyz).

---

## Automation
```bash
# Cron job - daily at 2am
0 2 * * * cd /path/to/workspace && node x1-vault-memory/src/backup.js >> /var/log/vault-backup.log 2>&1
```

---

## Files Backed Up

| File | Purpose |
|------|---------|
| IDENTITY.md | Agent name, persona, vibe |
| SOUL.md | Personality, instructions, expertise |
| USER.md | User profile and preferences |
| TOOLS.md | Environment-specific notes |
| memory/*.md | Daily memory logs |

---

## Security

- 🔐 Encrypted with NaCl secretbox using your wallet's secret key
- 🔑 Only your keypair can decrypt
- 📡 Stored on IPFS, not a single server
- ⛓️ CID recorded on X1 blockchain for permanence
- 🚫 Never share your wallet.json or PINATA_JWT

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Encryption | TweetNaCl (secretbox) |
| IPFS Storage | Pinata API (JWT auth) |
| Blockchain | X1 (SVM-compatible L1) |
| Runtime | Node.js |
| Archiving | tar (npm) |

---

## About X1

[X1](https://x1.xyz) is a high-performance, SVM-compatible Layer-1 blockchain.

- **Docs:** [docs.x1.xyz](https://docs.x1.xyz)
- **Explorer:** [explorer.mainnet.x1.xyz](https://explorer.mainnet.x1.xyz)
- **Testnet RPC:** https://rpc.testnet.x1.xyz
- **Mainnet RPC:** https://rpc.mainnet.x1.xyz

---

## License

MIT

---

**Built by [Lokoweb3](https://github.com/Lokoweb3) with Loko_AI 🦞**
