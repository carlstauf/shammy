#!/usr/bin/env bash
set -euo pipefail

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

container=${DB_CONTAINER:-shammy-postgres}

echo "Waiting for PostgreSQL ($container) to be ready..."
until docker exec "$container" pg_isready -U ${DB_USER:-shammy} -d ${DB_NAME:-shammy} >/dev/null 2>&1; do
  sleep 1
  printf '.'
done

echo "\nDatabase is ready, running migrations"
pushd packages/database >/dev/null
pnpm run migrate
popd >/dev/null

echo "Database initialised"
