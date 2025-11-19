#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR=${1:-backups}
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILE="$BACKUP_DIR/shammy_$TIMESTAMP.sql"

echo "Creating database backup at $FILE"
pg_dump "$DATABASE_URL" > "$FILE"
