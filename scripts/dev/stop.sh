#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE=${COMPOSE_FILE:-infra/docker/docker-compose.yml}

echo "Stopping turborepo dev processes (if any)"
if pgrep -f "turbo.*dev" >/dev/null 2>&1; then
  pkill -f "turbo.*dev"
fi

echo "Stopping docker compose"
docker-compose -f "$COMPOSE_FILE" down
