# GreenQuote

Solar financing pre-qualification application built for the Cloover Full-Stack Coding Challenge.

## Stack

Next.js · TypeScript · Prisma · SQLite · Zod · bcrypt · JWT · Pino · Vitest · Playwright

## Quick Start

Requirements:

* Node.js 20+ (LTS)
* npm
* make

Setup:

```bash
make setup
```

Run all quality checks: lint → unit/integration tests → production build

```bash
make check
```

Run:

```bash
make dev
```

Open:

```text
http://localhost:3000
```

### Seeded Admin

```text
Email: admin@test.com
Password: admin12345
```

Development credentials only.

## Test

Unit and integration tests:

```bash
make test
```

E2E:

```bash
make e2e
```

## API Documentation

Interactive OpenAPI documentation:

```text
http://localhost:3000/api-docs
```

Health check:

```text
GET /api/health
```

## Main User Flows

User:

```text
Register / Login
→ Quotes
→ New Quote
→ Pre-qualification Result
→ PDF Export
```

Admin:

```text
Login
→ Admin Quotes
→ Search by user
→ View Quote
→ PDF Export
```

## Architecture

The application uses Next.js App Router for both frontend and backend.

Business concerns are separated into authentication, validation, pricing, persistence, and logging modules.

See [Architecture](docs/architecture.md).

## Trade-offs

* SQLite was chosen for a small workload and zero-infrastructure local setup. PostgreSQL would be preferred for horizontally scaled production workloads.
* Authentication is implemented locally using signed JWT sessions instead of an external IdP such as Keycloak.
* Financing offers are stored as immutable JSON derived from each quote rather than normalized into another table.

More detail: [Architecture & Decisions](docs/architecture.md).
See [What I Would Do Next](docs/architecture.md#what-i-would-do-next)

## Documentation

* [Architecture](docs/architecture.md)
* [Authentication & Authorization](docs/authentication.md)
* [Testing](docs/testing.md)
* [Operations & Observability](docs/operations.md)
* [API Reference](docs/api.md)
