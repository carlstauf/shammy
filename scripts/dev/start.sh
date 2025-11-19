#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE=${COMPOSE_FILE:-infra/docker/docker-compose.yml}

echo "Launching infrastructure via docker compose"
docker-compose -f "$COMPOSE_FILE" up -d

echo "Waiting for services to warm up"
sleep 10

echo "Starting turborepo dev servers"
pnpm run dev
