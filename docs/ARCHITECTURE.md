# Architecture

Shammy uses a Turborepo monorepo consisting of:
- `apps/web`: Next.js 14 app for onboarding and dashboards.
- `packages/*`: shared type-safe packages (database schema, config, types).
- `services/*`: backend workers (MCP server, data processor) to be implemented.
- `infra/`: docker compose and IaC for databases, Redis, Airbyte, and supporting services.
