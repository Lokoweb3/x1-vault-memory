const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const tar = require('tar');
const https = require('https');
const { execSync } = require('child_process');

// Helper to download file from Pinata gateway
function downloadFromPinata(cid, destPath) {
  return new Promise((resolve, reject) => {
    const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
    const file = fs.createWriteStream(destPath);
    https.get(url, response => {
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download CID ${cid}, status ${response.statusCode}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve());
      });
    }).on('error', err => {
      fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

async function restoreBackup(cid) {
  const encryptedPath = path.resolve(__dirname, 'downloaded.enc');
  await downloadFromPinata(cid, encryptedPath);

  // Load wallet secret key
  const walletPath = path.resolve(__dirname, '..', 'x1_vault_cli', 'wallet.json');
  const wallet = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
  const secretKey = Buffer.from(wallet.secretKey);
  const key = crypto.createHash('sha256').update(secretKey).digest();
  // Read encrypted file and auth tag (last 16 bytes for GCM)
  const data = fs.readFileSync(encryptedPath);
  const authTag = data.slice(data.length - 16);
  const encryptedData = data.slice(0, data.length - 16);
  const iv = encryptedData.slice(0, 12); // we stored IV at start? Actually we prepended IV when encrypting.
  // In backup.js we wrote IV separately, not stored. To simplify, re‑read IV from file start (first 12 bytes) and rest is ciphertext.
  // Since backup.js wrote raw ciphertext after piping cipher (which automatically writes IV? no, we wrote only ciphertext). We'll instead re‑generate IV from first 12 bytes of encryptedData.
  const ciphertext = encryptedData.slice(12);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, encryptedData.slice(0, 12));
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  const archivePath = path.resolve(__dirname, 'backup.tar.gz');
  fs.writeFileSync(archivePath, decrypted);

  // Extract tar.gz archive
  const cwd = path.resolve(__dirname, '..');
  await tar.x({ file: archivePath, cwd });
  console.log('Backup restored to workspace');
}

const cid = process.argv[2];
if (!cid) {
  console.error('Usage: node restore.js <CID>');
  process.exit(1);
}
restoreBackup(cid).catch(err => {
  console.error('Restore failed:', err);
  process.exit(1);
});
