# Architecture

Shammy is a Turborepo monorepo consisting of:
- `apps/web`: Next.js 14 app for onboarding and dashboards.
- `packages/*`: shared type-safe packages (database schema, config, types).
- `services/*`: backend workers (MCP server, data processor) to be implemented.
- `infra/`: Docker Compose and IaC for databases, Redis, Airbyte, and supporting services.

## Technology Stack (non-negotiable)

Each tier below lists the mandated technologies, the rationale for using them, and how Shammy integrates them. When extending the project, wire new features into these exact systems.

### Tier 1: Core Infrastructure

**Supabase** — Authentication, primary PostgreSQL, realtime, and storage.  
Packages: `@supabase/supabase-js@^2.39.0`, `@supabase/auth-helpers-nextjs@^0.9.0`, `@supabase/ssr@^0.1.0`.
- OAuth for 30+ providers with refresh token management.
- Backed by PostgreSQL, exposing full SQL, RLS, and policies for multi-tenancy.
- Realtime subscriptions power live sync status updates in the UI.
- Storage buckets hold attachments and large import payloads.
- Edge Functions host webhook handlers and Supabase-triggered automation.

**Airbyte** — Canonical ETL engine.  
Components: Airbyte Server, Worker, and connector pods.
- Provides >600 maintained connectors and handles OAuth token refresh/regeneration.
- Built-in retries, CDC, incremental sync, and error handling.
- We rely on the following connectors: `source-gmail`, `source-github`, `source-google-calendar`, `source-google-drive`, `source-slack`, `source-notion`, `source-spotify`, `source-twitter`, plus custom connectors built through the CDK.
- Shammy’s BullMQ jobs trigger Airbyte syncs; results land back in the warehouse.

**PostgreSQL 16** — Central warehouse and search substrate.
- JSON/JSONB support, partitioning, and native FTS underpin the unified datastore.
- Schema strategy: `user_<uuid>` schemas per tenant plus a shared platform schema.
- Heavy analytics rely on materialized views.
- Enabled extensions: `pg_trgm`, `pg_stat_statements`, `btree_gin`, `unaccent`, `pgvector` (future-ready for semantic search).

**HPI (Human Programming Interface)** — Unified Python API when Airbyte lacks a connector.
- Abstracts gnarly data cleaning (timezones, encodings, etc.) and offers standardized models.
- Modules in use: `my.mail.all`, `my.github`, `my.browser`, `my.location`, `my.photos`, plus plugins for custom sources.
- Acts as the bridge between raw data, the MCP server, and downstream APIs.

### Tier 2: Data Processing & Storage

**Drizzle ORM** — Type-safe query layer with automatic migrations, prepared statements, pooling, and excellent TS inference. Deployed in `packages/database` with Drizzle Kit workflows.

**BullMQ** — Redis-backed queue powering sync orchestration, large file processing, embedding generation, and notification fan-out. Jobs leverage retries, backoff, priorities, and sandboxed execution.

**Meilisearch** — High-speed FTS fallback whenever PostgreSQL FTS is insufficient. Offers typo tolerance (<50 ms queries), faceted search, synonyms, ranking profiles, and multi-language support.

### Tier 3: AI Integration

**Model Context Protocol SDK (`@modelcontextprotocol/sdk@^0.5.0`)** — TypeScript MCP server exposes Shammy data to Claude Desktop/API with tool-based interfaces, streaming responses, caching, and 15+ bespoke tools (search, timeline, analytics, etc.).

**LangChain (Optional)** — Only introduce when building advanced AI workflows (agents, multi-step reasoning, document Q&A, embedding-powered semantic search with citations).

### Tier 4: Frontend & API

**Next.js 14 (App Router)** — Default server components, streaming SSR, server actions, built-in caching, RSC-first architecture, and TypeScript-by-default.

**shadcn/ui** — Copy-over Radix UI components styled with Tailwind. Core set includes Dialog, Sheet, Toast, Command palette, Table grids, Form integrations (react-hook-form), and chart primitives (Recharts).

**Tanstack Query** — Sole server-state manager providing caching, background refresh, optimistic mutations, pagination, infinite scroll, and devtools instrumentation.

### Tier 5: DevOps & Monitoring

**Docker + Docker Compose** — Defines PostgreSQL, Redis, Airbyte (server/worker/webapp), Supabase (optional local stack), Meilisearch, and Datasette in `infra/docker/docker-compose.yml`.

**Sentry** — Mandatory error/perf monitoring across frontend, background jobs, and APIs (5,000 events/month free tier).

**Prometheus + Grafana (Optional)** — Enable for richer infra and application metrics when required.
