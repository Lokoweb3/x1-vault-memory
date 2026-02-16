---
name: x1-vault-memory
description: Backup and restore OpenClaw agent memory to X1 Vault using encrypted IPFS storage with on-chain CID references.
---

# X1 Vault Memory Skill

## What It Does
Encrypts your agent's memory files, uploads them to IPFS, and records the CID on the X1 blockchain. Only your wallet can decrypt the backup.

## Requirements
Each user needs their own:
- **Pinata account** (free at https://app.pinata.cloud) — for IPFS uploads
- **Solana/X1 wallet keypair** — for encryption and on-chain transactions
- **X1 testnet tokens** — for transaction fees

## Setup

### 1. Install dependencies
```bash
cd x1-vault-memory
npm install
```

### 2. Set environment variables
```bash
export PINATA_JWT="your_pinata_jwt_token"
export X1_RPC_URL="https://rpc.testnet.x1.xyz"  # or mainnet
```

### 3. Create a wallet keypair
```bash
solana-keygen new --outfile wallet.json --no-bip39-passphrase
```

### 4. Fund the wallet
Get testnet tokens from https://faucet.testnet.x1.xyz

## Usage

### Backup
```bash
node src/backup.js
```
Encrypts IDENTITY.md, SOUL.md, USER.md, TOOLS.md, and memory/ — uploads to IPFS and stores CID on X1.

### Restore
```bash
node src/restore.js <CID>
```
Downloads from IPFS, decrypts, and restores all files.

## Where Data Is Stored
- **IPFS:** Encrypted blob stored on Pinata's IPFS network (accessible via any IPFS gateway)
- **X1 Blockchain:** CID recorded as an on-chain transaction
- **vault-log.json:** Local log of all backup CIDs and timestamps
- **Only your wallet keypair can decrypt the data**

## Security
- Never share your wallet keypair or PINATA_JWT
- Backups are encrypted with NaCl secretbox using your wallet's secret key
- Even if someone finds your CID, they cannot decrypt without your wallet

## Automation
Add to cron for daily backups:
```bash
0 2 * * * cd /path/to/workspace && node x1-vault-memory/src/backup.js
```
