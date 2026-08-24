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

Structured logging is implemented with Pino.

Logs cover important request, response, authentication, quote creation, and error paths.

Typical structured fields include:

```text
method
path
status
durationMs
userId
quoteId
err
```

Sensitive values such as passwords, password hashes, JWTs, and session cookies are never intentionally logged.

Development logs are also written to:

```text
logs/app.log
```

The application provides:

```text
GET /api/health
```

for liveness monitoring.

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

Given more time, I would prioritize:

1. Add Playwright E2E coverage for registration/login → quote creation → quote details.
2. Add OpenAPI documentation.
3. Add rate limiting to authentication endpoints.
4. Improve session lifecycle and revocation.
5. Add CI/CD running lint, tests, and production build.
6. Move to PostgreSQL for a horizontally scaled production deployment.
7. Add pagination to quote listings.
8. Add richer observability and centralized log collection.
9. Add amortization schedule details.
10. Add PDF quote export.

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