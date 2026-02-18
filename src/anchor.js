const { Connection, Keypair, Transaction, SystemProgram, PublicKey } = require('@solana/web3.js');
const bs58 = require('bs58');
const fs = require('fs');
const path = require('path');

// X1 Mainnet RPC
const RPC_URL = process.env.X1_RPC_URL || 'https://rpc.mainnet.x1.xyz';

async function anchorCID(cid, walletPath) {
  // Load wallet
  const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
  const secretKey = Uint8Array.from(walletData.secretKey);
  const keypair = Keypair.fromSecretKey(secretKey);
  
  console.log('Using wallet:', keypair.publicKey.toBase58());
  
  // Connect to X1 mainnet
  const connection = new Connection(RPC_URL, 'confirmed');
  
  // Check balance
  const balance = await connection.getBalance(keypair.publicKey);
  console.log('Wallet balance:', (balance / 1e9).toFixed(4), 'XN');
  
  if (balance < 0.002 * 1e9) {
    throw new Error('Insufficient balance. Need at least 0.002 XN for transaction fee.');
  }
  
  // Create transaction with CID in memo
  // X1/Solana supports memo program for on-chain data
  const { MemoProgram } = require('@solana/spl-memo');
  
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: keypair.publicKey,
      toPubkey: keypair.publicKey, // Send to self (just for the memo)
      lamports: 0, // 0 transfer, just recording memo
    })
  );
  
  // Add memo instruction with CID
  const memoInstruction = MemoProgram.memo({
    fromPubkey: keypair.publicKey,
    memo: `x1-vault-memory:${cid}`,
  });
  
  transaction.add(memoInstruction);
  
  // Sign and send
  console.log('Submitting transaction to X1 mainnet...');
  const signature = await connection.sendTransaction(transaction, [keypair]);
  
  // Wait for confirmation
  console.log('Waiting for confirmation...');
  await connection.confirmTransaction(signature, 'confirmed');
  
  return {
    signature,
    explorerUrl: `https://explorer.mainnet.x1.xyz/tx/${signature}`,
  };
}

module.exports = { anchorCID };
