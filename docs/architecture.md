# Architecture

## Overview

GreenQuote is a single Next.js application using the App Router for both frontend pages and backend API routes.

Core boundaries:

- `src/app/` — pages and API route handlers
- `src/components/` — reusable UI components
- `src/lib/auth.ts` — authentication/session helpers
- `src/lib/pricing.ts` — quote pricing logic
- `src/lib/validation/` — Zod schemas
- `src/lib/db.ts` — Prisma client
- `src/lib/logger.ts` — structured logging
- `prisma/` — schema, migrations, seed

## Request Flow

Quote creation follows:

```text
authenticate
→ validate
→ calculate
→ persist
→ respond
```


## Architecture Decisions

### Next.js for Frontend and Backend

Next.js App Router is used for both the UI and HTTP API.

This keeps the challenge as a single deployable application and avoids unnecessary infrastructure while still providing clear boundaries between:

* UI components
* API route handlers
* authentication
* validation
* persistence
* pricing/business logic

### SQLite

SQLite was selected because the challenge has:

* a small schema
* low expected concurrency
* no requirement for distributed database access
* a strong emphasis on quick local setup

It removes the need for a separate database service and makes the repository easier to clone and run.

For a production system running multiple application instances, PostgreSQL would be a likely migration target.

### Prisma

Prisma provides:

* schema definition
* migrations
* typed database access
* easy local inspection with Prisma Studio

### Pricing Logic Outside API Routes

Pricing logic is isolated in:

```text
src/lib/pricing.ts
```

API route handlers are responsible for orchestration:

```text
authenticate
→ validate
→ calculate
→ persist
→ respond
```

This keeps business logic independently testable.

### JWT Session

A lightweight signed JWT stored in an `httpOnly` cookie was selected instead of introducing a larger authentication framework or external identity provider.

For this scope, the application both issues and verifies the token, so HS256 is sufficient.

## Observability

Structured logging (Pino), the health endpoint, configuration, and deployment
notes are documented in [Operations & Observability](operations.md).

## Trade-offs

### SQLite Instead of PostgreSQL

SQLite keeps local setup fast and simple.

Trade-off:

It is not the preferred choice for high write concurrency or horizontally scaled application instances.

### Custom Authentication Instead of Keycloak

The challenge lists an external IdP such as Keycloak as a bonus.

A small credentials-based implementation was chosen to prioritize the required functionality.

Trade-off:

A production system would likely delegate identity management to an external IdP rather than managing credential authentication directly.

### Offers Stored as JSON

The three calculated offers are stored as JSON on the quote.

This is appropriate because they are immutable derived data belonging to a quote.

Trade-off:

If offers needed independent querying, modification, or reporting, they should be normalized into a separate table.

### File Logging

File logging is useful for local demonstration.

In a containerized production environment, logs would normally be written to stdout/stderr and collected by the hosting platform rather than persisted inside the container filesystem.

## Security Considerations

Implemented:

* bcrypt password hashing
* signed JWT sessions
* `httpOnly` cookies
* `secure` cookies in production
* `SameSite=Lax`
* server-side authorization
* ownership checks
* generic login errors
* server-side request validation

Additional production hardening would include:

* login rate limiting
* CSRF review/protection for state-changing endpoints
* stronger password policy
* email verification
* password reset flow
* session revocation/rotation
* audit logging
* security headers
* secret management through the deployment platform

## What I Would Do Next

Delivered beyond the core requirements: OpenAPI documentation at `/api-docs`,
a Playwright end-to-end test covering sign-in through quote results, and PDF
export of a quote.

Given more time, I would prioritize:

1. Rate limiting on the authentication endpoints.
2. Session revocation and refresh, rather than a fixed one-hour token.
3. CI/CD running lint, tests, and a production build on every push.
4. PostgreSQL, for a horizontally scaled deployment.
5. Pagination on the quote listings, which currently fetch every row.
6. An amortization schedule per offer, surfaced in the UI and the PDF.
7. Centralized log collection and request-level tracing.
8. CSRF protection on state-changing endpoints.

## Production Deployment

A straightforward GCP deployment would use Cloud Run for the Next.js application.

For a production-grade deployment, SQLite would be replaced with PostgreSQL, for example Cloud SQL for PostgreSQL.

A CI pipeline would run:

```text
install
→ lint
→ tests
→ production build
→ deploy
```