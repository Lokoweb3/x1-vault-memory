set -euo pipefail
cd /home/node/.openclaw/workspace
node vault-backup/restore.js "$@"
