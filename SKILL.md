---
name: x1-vault-memory
description: Skill to backup and restore your OpenClaw memory files (IDENTITY.md, SOUL.md, USER.md, TOOLS.md, memory/*.md) to the X1 Vault via Pinata. Uses the existing `vault-backup/backup.js` and `vault-backup/restore.js` scripts. Provides CLI commands and sub‑agent usage for automated backups.
---

# X1 Vault Memory Skill

## Purpose
- Securely archive your personal OpenClaw memory (identity, soul, user, tools, daily logs) to the X1 Vault.
- Enable quick restoration of all memory files in case of workspace loss.
- Operates via the Pinata `pinFileToIPFS` endpoint using the `PINATA_JWT` environment variable.

## Setup
1. Ensure `PINATA_JWT` is set in your environment.
2. The skill expects the helper scripts in `../vault-backup/`:
   - `backup.js` – creates a tarball of memory files and uploads to Pinata.
   - `restore.js` – downloads and extracts a backup CID.
3. No additional dependencies are required.

## Commands
### Backup
```bash
# From the workspace root
node vault-backup/backup.js
```
- Generates `backup.tar.gz.enc` and uploads it.
- The CID is printed; copy it for later restores.

### Restore
```bash
# Replace <CID> with the backup CID you saved
node vault-backup/restore.js <CID>
```
- Downloads the encrypted archive, decrypts (uses your local key), and overwrites the memory files.

## Sub‑Agent Usage (recommended)
You can run backups as an isolated sub‑agent so it doesn’t block your main session:
```json
{
  "agentId": "x1-vault-memory",
  "task": "node vault-backup/backup.js",
  "label": "Memory backup",
  "model": "default",
  "runTimeoutSeconds": 300
}
```
The sub‑agent will report the CID back as a system event.

## Restoration Workflow
1. Retrieve the CID from the backup event or from your notes.
2. Run the restore command above.
3. Verify that `IDENTITY.md`, `SOUL.md`, `USER.md`, `TOOLS.md`, and `memory/` are restored.

## Security Notes
- The backup archive is encrypted with the key in `vault-backup/backup.key` – keep it safe.
- Do **not** expose your `PINATA_JWT` in logs or messages.
- Only run restore when you trust the source CID.

## FAQ
**Q:** Can I schedule automatic backups?
**A:** Yes – create a cron job that runs `node vault-backup/backup.js` and stores the CID in a log file.

**Q:** What if the backup fails?
**A:** The script returns a non‑zero exit code and prints an error; investigate the console output.

---
