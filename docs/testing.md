## Testing

The project uses Vitest. The test suite contains a mix of unit, route-level, and integration coverage.

Run:

```bash
npm test
```

### Unit Tests

Pricing tests cover:

* System price calculation
* Risk band A/B/C selection
* APR selection
* Down payment handling
* 5/10/15 - year terms
* Amortized monthly payments

Validation tests cover:

* Valid registration
* Malformed email
* Short passwords
* Invalid quote values

### Integration / Route Tests

Coverage includes:

* Registration
* Duplicate email handling
* Login
* Generic invalid-credential responses
* Session creation
* Prisma/SQLite persistence
* User → Quote relationships
* Quote ownership
* Admin access to another user's quote
* Forbidden access for regular users
* Error mapping: an expired session returns `401`, a database failure returns `500`

### End-to-End

Playwright covers sign-in → quote creation → results, asserting the computed
monthly payments for all three terms:

```bash
npm run test:e2e
```

`make check` runs lint, the Vitest suite, and a production build. The E2E suite
is run separately with `make e2e`, since it starts a dev server.