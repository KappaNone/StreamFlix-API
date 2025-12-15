# StreamFlix API

NestJS + Prisma backend that powers StreamFlix. It exposes CRUD endpoints for titles, seasons, episodes, and now subscription management with trials, invitations, and plan catalog support.

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

- First subscription per user automatically gets a 30-day trial (configurable per plan).
- Invitations provide a 25% discount on the invitee's first paid month and extend the inviter's active subscription by 7 days.

## Testing & Linting

```powershell
npm run lint
npm run test -- subscription
```

Use `npm run test:e2e` for the full end-to-end suite once a database is available.

## Documentation

Detailed schema and business rules live in `docs/subscription-design.md`, which also maps to the ERD supplied by the product team.
