## Authentication and Authorization

Sessions are implemented using signed JWTs stored in `httpOnly` cookies.

The JWT contains only the data required for authorization:

```text
userId
email
role
```

Protected routes derive user identity from the verified session rather than accepting `userId` or `role` from client input.

Quote ownership is enforced server-side:

* users can only view their own quotes
* administrators can view all quotes
* admin pages and endpoints require the `ADMIN` role

Login responses intentionally return the same `401` response for an unknown email and an incorrect password to reduce account enumeration.