## API

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
```

### Quotes

```text
POST /api/quotes
GET  /api/quotes
GET  /api/quotes/:id
```

### Admin

```text
GET /api/admin/quotes
```

### Health

```text
GET /api/health
```

The health endpoint is intended as a lightweight liveness check.

Example response:

```json
{
  "status": "ok"
}
```