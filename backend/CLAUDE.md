# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands are run from the `backend/` directory.

```bash
# Development
make air              # Run with hot-reload (Air)
make run              # Generate docs + sqlc, then run

# Code quality
make fmt              # go fmt
make vet              # go vet
make test             # Run unit tests with coverage
make bench            # Run benchmarks

# Build
make build            # Compile binary
make docs             # Generate Swagger docs (swag init)
make sqlc-gen         # Regenerate type-safe SQL code from queries/

# Database migrations
make migration_up     # Apply migrations
make migration_down   # Rollback all migrations

# Infrastructure
make compose_up       # Start PostgreSQL via docker-compose (from project root)
make compose_down     # Stop services

# Install tools
make install          # Install all dev tools: air, swag, migrate, sqlc
```

Run a single test: `go test ./internal/... -run TestName -v`

## Architecture

Clean/Hexagonal architecture with strict layer separation:

```
cmd/api/main.go          → Entry point: wires everything together
configs/config.go        → Viper-based config loader (env vars via reflection)
internal/
  entity/                → Domain models with validation logic
  dto/                   → Request/response contracts (input/output DTOs)
  service/               → Use cases; depends on repository interfaces
  infra/
    database/postgresql/
      migrations/        → SQL schema migrations (golang-migrate)
      queries/           → Raw SQL definitions read by sqlc
      sqlc/              → Generated type-safe Go code (do not edit manually)
      sqlc_*_repository.go → Repository implementations wrapping sqlc
    web/
      handlers/          → Gin HTTP handlers; call services, map DTOs
      webserver/server.go → Router setup, middleware, Swagger mount
```

**Data flow:** Handler → DTO → Service → Entity (validation) → Repository → sqlc → PostgreSQL

**Key constraint:** `sqlc/` directory is generated from `queries/query.sql` via `make sqlc-gen`. Never edit files there directly — edit the `.sql` source and regenerate.

## Intended Module Structure

The codebase is being organized around 6 domain modules (per `.docs/`). New features should follow this module boundary inside `internal/`:

| Module | Responsibility |
|--------|---------------|
| `profile` | User identity, preferences (units, language, notifications) |
| `assessment` | Biometric snapshots: weight, body fat, bioimpedance, anamnesis |
| `project` | Goals (cut/bulk/recomposition/maintenance), protocols, diet/workout plans |
| `fitness` | Meal/water/supplement logging, AI macro parsing, food inventory, workout execution |
| `journey` | Events agenda, gamification milestones, sleep/mood/stress trackers |
| `analytics` | Daily dashboard, shape evolution, physiological feedback |

Currently only `user` exists as a proof-of-concept. The SQL schema already defines most tables to support all modules.

## AI Integration

The core value is converting natural-language meal descriptions into structured macros via LLM. `GEMINI_API_KEY` is required. The planned AI layer will abstract multiple providers (Anthropic, OpenAI, Gemini, Ollama, LlamaCPP) behind a common interface — avoid hardcoding provider-specific logic.

## MVP Scope

MVP targets are hardcoded: **150g protein / 165g carbs / 71g fat / 1850kcal**. The active goal is body recomposition. Business rules to implement:
- Max 2 slices/day of ham, turkey breast, or cheese combined
- Whey usage flag: track days without whey

## API

- Base path: `/api/v1`
- Swagger UI: `http://localhost:8080/api/v1/swagger/index.html`
- Logging: JSON structured logs via `log/slog` to stdout

## Environment

Copy `.env.example` to `.env`. Required variables:

```
DB_DRIVER, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
WEB_SERVER_PORT
GEMINI_API_KEY
```

## Database

PostgreSQL 16 with `pgcrypto` for UUID generation. Schema has 7 tables (`users`, `assessments`, `projects`, `goals`, `protocols`, `diet_plans`, `meal_logs`) and 2 analytics views (`daily_macro_summary`, `user_daily_performance`). All tables use soft deletes via `deleted_at`.

The SQL files in `queries/` and `migrations/` are currently single files. Per `.docs/TODO.md`, they should be split per entity/module as the schema grows.

## Planned Tooling (not yet added)

- Router: migrate from Gin to `chi`
- Linting: `golangci-lint`
- Testing: `testify` + `testcontainers`
- Observability: OpenTelemetry (logs, metrics, traces)
- Auth: JWT
- Cache: Redis (already in docker-compose but commented out)


## Agent Behavior
- Read ONLY files directly relevant to the task. Do not explore the full project.
- Do not read files you already know the structure of (listed below).
- Prefer editing existing files over creating new ones.
- Ask before reading more than 3 files to understand context.
