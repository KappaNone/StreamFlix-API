# StreamFlix API

NestJS + Prisma backend that powers StreamFlix. It exposes CRUD endpoints for titles, seasons, episodes, and now subscription management with trials, invitations, and plan catalog support.

## Features

- JSON and XML support for all endpoints (set `Accept: application/xml` for XML responses, `Content-Type: application/xml` for XML requests)
- Swagger documentation at `/docs`
- Prisma ORM with PostgreSQL
- JWT authentication
- Subscription management with trials and referrals

## Prerequisites

- Node.js 20+
- Docker (optional but recommended for Postgres)

## Getting Started

```powershell
npm install
Copy-Item .env.example .env
# adjust DATABASE_URL and JWT secrets
npm run db:deploy
npm run studio # optional – inspect data
npm run start:dev
```

For demo seed users, set a password via `DEMO_USERS_PASSWORD` in your `.env`.
If it is not set, the seed will generate a random password and print it once.

If you use Docker, you can start the stack with:

```powershell
npm run docker
```

### API Formats

The API supports both JSON and XML formats:

- **JSON**: Default format
- **XML**: Set `Accept: application/xml` in request headers for XML responses. For POST/PUT requests, set `Content-Type: application/xml` and send XML data.

### Developer Tooling

- Swagger UI: http://localhost:4000/docs (proxied from the Nest app running on port 3000).
- Prisma Studio: http://localhost:5555 when `npm run docker` (or `npm run studio`) is active.

## Prisma & Database

- `npx prisma generate` whenever `prisma/schema.prisma` changes.
- `npm run db:deploy` resets the database using migrations and seeds sample titles, users, subscription plans, and a demo invitation.

## Internal Employees (DBMS-only)

The assignment requires three internal employee roles that work **directly** in the DBMS (not via the API):

- **Junior**: read basic account + profile info.
- **Mid**: read basic info + limited changes (profile settings + activate/deactivate accounts), no financial/subscription data.
- **Senior**: full access including subscriptions and viewing history.

This is implemented at the PostgreSQL level via roles, views, and grants in the migration
[prisma/migrations/20260118130000_internal_employees_dbms_access/migration.sql](prisma/migrations/20260118130000_internal_employees_dbms_access/migration.sql).

To avoid hardcoded passwords in the repository, the migration only creates **NOLOGIN roles**.
Create your own DBMS login users and grant them a role, for example:

```sql
CREATE ROLE streamflix_junior LOGIN PASSWORD 'choose_a_password';
GRANT streamflix_junior_role TO streamflix_junior;
```

Example read-only objects:

- `public.employee_user_basic`
- `public.employee_profile_basic`

## Subscription API Snapshot

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/subscriptions/plans` | List SD/HD/UHD plans with pricing. |
| `POST` | `/subscriptions` | Create or switch a subscription (handles trials & invitation codes). |
| `GET` | `/subscriptions/:id` | Fetch a subscription with plan + invitation metadata. |
| `PATCH` | `/subscriptions/:id` | Update plan, cancel at period end, or toggle auto-renew. |
| `POST` | `/subscriptions/invitations` | Issue invite codes with configurable discounts. |
| `POST` | `/subscriptions/invitations/redeem` | Validate an invite for the current user before applying it. |

### Trials & Discounts

- First subscription per user automatically gets a 7-day trial (pulls from each plan's `trialDays`).
- Invitation codes grant the same temporary discount to both invitee and inviter for `discountDurationDays`, and every account can only redeem a referral discount once.
 
## Testing & Linting

```powershell
npm run lint
npm run test -- subscription
```

Use `npm run test:e2e` for the full end-to-end suite once a database is available.

## Documentation

Detailed schema and business rules live in `docs/subscription-design.md`, which also maps to the ERD supplied by the product team.
