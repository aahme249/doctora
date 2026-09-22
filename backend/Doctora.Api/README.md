# Doctora.Api

ASP.NET Core (.NET 9) minimal-API backend for Doctora, replacing the Next.js
`app/api/*` route handlers. Talks to the same Neon Postgres database via
EF Core + Npgsql, mapped onto the existing tables (`patients`, `appointments`,
`records`, `appointment_requests`) so no data migration is needed.

## Configure secrets (local dev)

```bash
cd backend/Doctora.Api
dotnet user-secrets set "DATABASE_URL" "postgres://<user>:<password>@<host>/<db>?sslmode=require"
dotnet user-secrets set "Gmail:User" "you@gmail.com"
dotnet user-secrets set "Gmail:AppPassword" "<gmail app password>"
dotnet user-secrets set "FRONTEND_ORIGIN" "http://localhost:3000"
```

`DATABASE_URL` accepts either the `postgres://` URI Neon gives you or a native
Npgsql key-value connection string. Gmail settings are optional — the email
endpoint silently no-ops (`{ ok: true, skipped: true }`) if unset, matching
the old Next.js behavior.

In production, set the same values as environment variables:
`DATABASE_URL`, `Gmail__User`, `Gmail__AppPassword`, `FRONTEND_ORIGIN`.

## Run

```bash
dotnet run
```

Starts on `http://localhost:5289` by default (see `Properties/launchSettings.json`).

## Endpoints

Mirrors the previous Next.js routes:

- `GET/POST /api/patients`, `PATCH/DELETE /api/patients/{id}`
- `GET/POST /api/appointments`, `PATCH/DELETE /api/appointments/{id}`
- `GET/POST /api/records`, `PATCH/DELETE /api/records/{id}`
- `GET/POST /api/appointment-requests`, `PATCH/DELETE /api/appointment-requests/{id}`
- `POST /api/email`
- `POST /api/seed`

## Next steps

The Next.js app's `lib/context.tsx` still reads/writes `localStorage` instead
of calling these APIs — that predates this migration and is unrelated to it.
To finish the split, point the frontend's data layer at this API's base URL
(e.g. `http://localhost:5289`) instead of `/api/*`, and this project can take
over as the sole backend.
