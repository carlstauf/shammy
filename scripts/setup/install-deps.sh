#!/usr/bin/env bash
set -euo pipefail

echo "Installing Shammy dependencies..."

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm not found, installing globally via npm"
  npm install -g pnpm@8
fi

echo "Installing workspace dependencies"
pnpm install

echo "Dependencies ready"
