#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE=${COMPOSE_FILE:-infra/docker/docker-compose.yml}

bash scripts/dev/stop.sh || true

echo "Removing docker volumes"
docker volume ls -q | grep '^shammy' | xargs -r docker volume rm

echo "Pruning containers"
docker-compose -f "$COMPOSE_FILE" down -v
