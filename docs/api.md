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
GET  /api/quotes/:id/pdf
```

All quote endpoints require a session. `:id` routes return `403` unless the
caller owns the quote or has the `ADMIN` role. The `/pdf` route returns the
quote as a downloadable PDF document.

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

## Error Responses

| Status | Meaning |
| --- | --- |
| `400` | Request body failed validation |
| `401` | Missing, expired, or invalid session |
| `403` | Authenticated but not permitted to access the resource |
| `404` | Resource does not exist |
| `409` | Email already registered |
| `500` | Unexpected server error |

The full specification is served at `/api-docs`.
