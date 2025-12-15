# Subscription & Invitation Design

_Last updated: 2025-12-15_

## Goals

- Offer StreamFlix customers the choice between SD, HD, and UHD subscription tiers with realistic euro pricing.
- Provide a 30-day free trial for first-time subscribers.
- Allow existing customers to invite friends with a one-month 25% discount on the invitee's first paid month and the inviter earning an extra 7 days of service.
- Keep the solution fully in TypeScript (NestJS + Prisma) and make sure it is testable and well documented.

## Data Model Summary

| Model | Purpose | Key Fields |
| --- | --- | --- |
| `SubscriptionPlan` | Canonical definition of plans (seeded) | `code`, `name`, `priceCents`, `currency`, `maxQuality`, `concurrentStreams`, `trialDays` |
| `Subscription` | User's current subscription state | `userId`, `planId`, `status`, `currentPeriodStart`, `currentPeriodEnd`, `trialEndsAt`, `autoRenew`, `discountPercent`, `discountEndsAt`, `invitationId`, `invitedByUserId` |
| `Invitation` | Invite codes and redemption tracking | `code`, `inviterId`, `inviteeEmail`, `status`, `discountPercent`, `discountDurationDays`, `expiresAt`, `redeemedAt`, `subscriptionId` |

Supporting enums:

- `SubscriptionStatus`: `ACTIVE`, `PAUSED`, `CANCELED`.
- `InvitationStatus`: `PENDING`, `REDEEMED`, `EXPIRED`, `CANCELED`.

Relations

- `User` has many `Subscription` entries (typically only the latest `ACTIVE` matters).
- `SubscriptionPlan` has many `Subscription` entries.
- `Invitation` belongs to an inviter `User` and optionally links to the redeemed `Subscription`.
- `Subscription` may reference the `Invitation` it was created with (for auditing) and the inviter user.

## Business Rules

1. **Plan Catalog**
   - SD: `code="basic_sd"`, €7.99, `maxQuality=SD`, `concurrentStreams=1`.
   - HD: `code="standard_hd"`, €11.99, `maxQuality=HD`, `concurrentStreams=2`.
   - UHD: `code="premium_uhd"`, €15.99, `maxQuality=UHD`, `concurrentStreams=4`.
2. **Trial**
   - First subscription per user receives 30 trial days (configurable per plan via `trialDays`).
   - Trial end date stored in `Subscription.trialEndsAt`.
   - Billing cycle (`currentPeriodStart` → `currentPeriodEnd`) begins at trial end.
3. **Invitations**
   - Inviter can create an invitation by email; system issues a random 10-character code.
   - Invitation expires after 30 days unless redeemed.
   - When invitee redeems the code while creating a subscription, they get 25% discount (`discountPercent`) for `discountDurationDays = 30`.
   - Inviter earns an extra 7 days appended to their `currentPeriodEnd` (if active) or credited via metadata (future enhancement).
4. **Subscription lifecycle**
   - Exactly one `ACTIVE` subscription per user enforced.
   - `PATCH /subscriptions/:id` supports plan changes (prorate by resetting `currentPeriodStart` and `currentPeriodEnd`).
   - Cancellation sets status to `CANCELED` and stops auto-renew at the end of the period.

## API Surface (initial scope)

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/subscriptions/plans` | Public plan catalog. |
| `POST` | `/subscriptions` | Create or swap the caller's subscription. Body: `userId`, `planCode`, optional `invitationCode`. |
| `PATCH` | `/subscriptions/:id` | Update plan or cancellation flags. |
| `POST` | `/subscriptions/invitations` | Create invite (body: `inviterUserId`, `inviteeEmail`). |
| `POST` | `/subscriptions/invitations/redeem` | Redeem invitation separately when needed. |
| `GET` | `/subscriptions/:id` | Retrieve subscription with plan + invitation metadata. |

All endpoints can later be guarded with JWT once auth flow is wired up.

## Validation & Edge Cases

- Reject plan creation if `planCode` doesn't exist.
- Ensure invite code is `PENDING`, not expired, and not tied to another subscription before applying discount.
- Users cannot subscribe twice simultaneously; POST should update existing subscription instead.
- Trial only granted if `Subscription` count for user == 0.
- Discount percent bounded: `0 <= discountPercent <= 100`. Duration stored in days.
- Invitation creation requires unique `inviteeEmail`+`PENDING` pair from same inviter to prevent spam.

## Testing Strategy

1. **Unit tests**: verify the `SubscriptionService` handles
   - plan lookup & validation,
   - trial assignment, and
   - invite discount logic (grant + mark redeemed + extend inviter).
2. **Integration/E2E**: extend `test/app.e2e-spec.ts` to create a user, list plans, create a subscription with a trial, redeem an invitation, and confirm pricing metadata.
3. **Seeder**: extend `prisma/seed.ts` to insert plan catalog and demo invites for local testing.