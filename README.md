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
