#!/usr/bin/env bash
set -euo pipefail

pushd packages/database >/dev/null
pnpm run migrate
popd >/dev/null
