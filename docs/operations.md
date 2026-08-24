# Operations & Observability

## Configuration

Configuration is supplied entirely through environment variables. See `.env.example`.

| Variable | Purpose | Example |
| --- | --- | --- |
| `DATABASE_URL` | SQLite database location | `file:./cloover.db` |
| `SESSION_SECRET` | HMAC key used to sign session JWTs | a long random string |
| `LOG_LEVEL` | Pino log level | `info` |

`SESSION_SECRET` is required. The application fails fast at startup if it is missing rather than falling back to a default, so a misconfigured deployment cannot silently issue forgeable sessions.

## Running Locally

```bash
make setup    # install, create .env, generate client, migrate, seed
make dev      # start the development server
make check    # lint, unit/integration tests, production build
make e2e      # Playwright end-to-end suite
make db-reset # drop and recreate the database, then reseed
```

## Health

```text
GET /api/health
```

```json
{ "status": "ok" }
```

This is a liveness check only — it does not probe the database. A readiness
check that verifies database connectivity would be the next addition for a
container orchestrator.

## Structured Logging

Logging uses Pino. Every log line carries `service: cloover-greenquote` plus
the request context:

```text
method
path
status
durationMs
userId
quoteId
err
```

Authentication, quote creation, and all error paths are logged. Errors are
mapped to responses in `src/lib/api-error.ts`, which is also the single place
where failures are logged with their status, so a 401 and a 500 are always
distinguishable in the logs.

Passwords, password hashes, JWTs, and session cookies are never logged.

In development, logs are written both to the console (`pino-pretty`) and to
`logs/app.log`.

### Production Note

Writing logs to a file inside the container is convenient for local
demonstration but is not the right production choice. A containerized
deployment should write to stdout/stderr and let the platform collect them —
on Cloud Run, that means logs flow into Cloud Logging with no application
changes. Switching this is a one-line change in `src/lib/logger.ts`.

## Deployment

The application is a single Next.js deployable. On GCP, Cloud Run is the
natural target: it is request-driven, scales to zero, and needs no cluster
management for a workload this size.

For production, SQLite would be replaced with Cloud SQL for PostgreSQL, since
a file-backed database cannot be shared across horizontally scaled instances.

A CI pipeline would run:

```text
install → lint → test → build → deploy
```
