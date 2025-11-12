#!/usr/bin/env bash
# Execute all chunk files in order using psql.
# Usage: DATABASE_URL="postgres://user:pass@host:port/db" ./sql/run-chunks.sh
set -euo pipefail
if [ -z "${DATABASE_URL:-}" ]; then
  echo "Please set DATABASE_URL environment variable (e.g. export DATABASE_URL=postgres://user:pass@host:port/db)"
  exit 2
fi
CHUNKS_DIR="sql\for_later_usage\_chunks"
for f in $(ls -1 "$CHUNKS_DIR" | sort -V); do
  echo "Executing $CHUNKS_DIR/$f..."
  psql "$DATABASE_URL" -f "$CHUNKS_DIR/$f"
done
echo "All chunks executed."
