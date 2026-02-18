const { Connection, Keypair, Transaction, SystemProgram } = require('@solana/web3.js');
const fs = require('fs');

// X1 Mainnet RPC
const RPC_URL = process.env.X1_RPC_URL || 'https://rpc.mainnet.x1.xyz';

async function anchorCID(cid, walletPath) {
  try {
    // Load wallet
    const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
    const secretKey = Uint8Array.from(walletData.secretKey);
    const keypair = Keypair.fromSecretKey(secretKey);
    
    console.log('Using wallet:', keypair.publicKey.toBase58());
    
    // Connect to X1 mainnet
    const connection = new Connection(RPC_URL, 'confirmed');
    console.log('Connected to', RPC_URL);
    
    // Check balance
    const balance = await connection.getBalance(keypair.publicKey);
    console.log('Wallet balance:', (balance / 1e9).toFixed(4), 'XN');
    
    if (balance < 0.002 * 1e9) {
      throw new Error('Insufficient balance. Need at least 0.002 XN for transaction fee.');
    }
    
    // Try with a simple transfer instruction
    const transferInstruction = SystemProgram.transfer({
      fromPubkey: keypair.publicKey,
      toPubkey: keypair.publicKey,
      lamports: 0,
    });
    
    const transaction = new Transaction().add(transferInstruction);
    console.log('Transaction created');
    
    // Send transaction
    console.log('Submitting transaction to X1 mainnet for CID:', cid);
    const signature = await connection.sendTransaction(transaction, [keypair]);
    
    // Wait for confirmation
    console.log('Waiting for confirmation...');
    await connection.confirmTransaction({ signature }, 'confirmed');
    
    return {
      signature,
      explorerUrl: `https://explorer.mainnet.x1.xyz/tx/${signature}`,
      cid,
    };
  } catch (err) {
    console.error('Detailed error:', err.message);
    throw err;
  }
}

module.exports = { anchorCID };
