# Database Implementation - Stored Procedures and Triggers

## Overview
This document describes the implementation of advanced database features including stored procedures, triggers, and transactional workflows in the StreamFlix API. These components enforce business logic at the database layer, ensuring data integrity and consistency across concurrent operations.

---

## Architecture & Design

### 1. Stored Procedures
Stored procedures encapsulate complex business logic within the database, providing several advantages:

- **Atomicity**: Multi-step operations complete as a single unit
- **Performance**: Reduced network round-trips between application and database
- **Security**: Authorization can be enforced at the procedure level
- **Consistency**: Centralizes business rules to prevent inconsistent state

Four key procedures were implemented:

#### activate_user_account(user_id INT)
**Purpose**: Enables user accounts that have been previously deactivated.

**Implementation Details**:
- Updates the `isActive` flag to true
- Sets `updatedAt` timestamp to current time
- Validates user exists before execution
- Returns updated user record for confirmation

**Access Control**: Mid-level employee role for account management operations

#### deactivate_user_account(user_id INT)
**Purpose**: Disables user accounts for suspended or terminated users.

**Implementation Details**:
- Sets `isActive` flag to false
- Maintains audit trail through `updatedAt` timestamp
- Preserves all historical data
- Returns confirmation with updated status

**Access Control**: Mid-level employee role with audit logging

#### renew_subscription(subscription_id INT)
**Purpose**: Processes subscription renewal at the end of billing period.

**Implementation Details**:
- Updates subscription period dates to current + 30 days
- Sets status to ACTIVE
- Validates subscription record exists
- Throws exception if subscription not found
- Ensures period transitions are continuous

**Business Logic**: Handles automatic renewal workflow without application layer dependencies

#### apply_referral_discount(subscription_id INT, discount_percent INT, duration_days INT)
**Purpose**: Applies referral bonuses with constraint validation.

**Implementation Details**:
- Validates user has not previously used referral discount
- Checks `referralDiscountUsed` flag on User table
- Sets discount percentage and expiration date
- Updates user flag to prevent reuse
- Enforces business rules at database layer to prevent application bypass

**Constraint**: Prevents abuse of discount system through duplicate applications

#### redeem_invitation(invitation_code TEXT, user_id INT)
**Purpose**: Completes the invitation redemption workflow with transactional safety.

**Implementation Details**:
- Validates invitation code is pending and not expired
- Retrieves inviter's active subscription
- Updates invitation status to REDEEMED with timestamp
- Applies discount to user's subscription
- All steps execute atomically or all rollback on error

**Workflow Steps**:
1. Locate invitation by code with status and expiration checks
2. Validate inviter has active subscription
3. Update invitation record with redemption details
4. Apply discount parameters to target subscription
5. Return success confirmation with applied discount percentage

**Error Handling**: Clear exceptions for invalid codes, expired invitations, or inactive inviters

---

### 2. Triggers
Triggers enforce automatic actions and constraints when data changes occur. Five triggers were implemented to maintain data consistency:

#### Timestamp Maintenance Triggers
Three triggers automatically update the `updatedAt` column during modifications:

**user_update_timestamp**, **profile_update_timestamp**, **subscription_update_timestamp**

**Purpose**: Maintains accurate modification timestamps for audit trails

**Implementation**:
- Fires BEFORE UPDATE on respective tables
- Sets `updatedAt` to current timestamp
- Prevents manual timestamp manipulation
- Ensures consistency in audit logging

**Benefit**: Guarantees audit trail accuracy without application-level timestamp handling

#### subscription_validate_period
**Purpose**: Enforces logical constraints on subscription period transitions.

**Validation Rules**:
- Period end date must be after period start date
- Active subscriptions cannot have expired periods
- Detects data integrity issues at database layer

**Implementation**: BEFORE INSERT OR UPDATE trigger that raises exceptions for violations

**Benefit**: Prevents impossible states from being persisted to the database

#### subscription_referral_rules
**Purpose**: Enforces business constraints on referral discount usage.

**Validation Rules**:
- Validates against `referralDiscountUsed` flag during subscription creation
- Prevents users from applying multiple referral discounts
- Raises exception if user has already exhausted discount allocation

**Implementation**: BEFORE INSERT trigger that checks User table state

**Benefit**: Prevents application logic bypass by enforcing rules at database layer

---

### 3. Transactional Consistency
Database transactions ensure that complex multi-step operations maintain consistency. A user registration workflow is documented as an example of transaction-based development:

#### Example: User Registration Transaction
**Scenario**: New user account setup with subscription initialization

**Transaction Isolation Level**: READ_COMMITTED

**Isolation Level Rationale**:

The READ_COMMITTED isolation level was selected based on the following criteria:

| Criterion | Rationale |
|-----------|-----------|
| Dirty Read Prevention | Prevents reading uncommitted data from concurrent transactions |
| Concurrency Requirements | Allows multiple user registrations to execute simultaneously without serialization |
| Performance Considerations | Avoids excessive row/table locking overhead |
| Financial Data Handling | Sufficient consistency guarantees for subscription financial operations |
| Implementation Complexity | Balanced tradeoff between isolation guarantees and system complexity |

**Transaction Steps**:
```sql
BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;
  1. INSERT User record → obtains new user_id
  2. INSERT Profile record → links to user via foreign key
  3. INSERT Subscription record → initializes with trial period
  4. INSERT ProfilePreference record → completes initial setup
COMMIT;
```

**Atomicity Properties**:
- All four operations complete successfully and simultaneously become visible to other transactions
- OR all operations are rolled back if any step fails
- No partial or intermediate states are visible to other transactions

**Rollback Scenario Example**:
If the email address violates the unique constraint during User insertion, the entire transaction is rolled back. This prevents orphaned Profile, Subscription, or ProfilePreference records that lack a valid User reference.

**ACID Guarantee Breakdown**:
- Atomicity: All-or-nothing operation completes or fails entirely
- Consistency: Foreign key constraints enforced throughout transaction
- Isolation: READ_COMMITTED prevents interference from concurrent user registrations
- Durability: Once committed, changes persist across system failures

---

### 4. Transactional Example Rationale

### Why These Procedures?
The selected procedures address critical business requirements:

1. **Account Management** (activate/deactivate): Required for user lifecycle management and access control
2. **Subscription Renewal**: Handles recurring billing and period transitions
3. **Referral Discount Application**: Enforces discount allocation rules with validation
4. **Invitation Redemption**: Coordinates multi-step workflow between invitation and subscription systems

These operations benefit from database-layer implementation because they enforce invariants that should not be bypassable by any application client.

### Why These Triggers?
Triggers enforce three categories of constraints:

1. **Audit Trail Integrity**: Timestamp triggers ensure modification tracking is automatic and accurate
2. **Data Validation**: Period validation trigger prevents logically impossible states
3. **Business Rule Enforcement**: Referral rules trigger prevents discount abuse at source

Implementing these at the database layer ensures consistency regardless of which application client connects to the database.

### Data Integrity Strategy
The implementation uses multiple layers of constraint enforcement:

- **Structural**: Primary keys, foreign keys with cascade options
- **Semantic**: Unique constraints, check constraints via enums
- **Procedural**: Stored procedures for complex validation
- **Triggerable**: Triggers for automatic enforcement of audit and business rules

This layered approach ensures that no single point of failure can compromise data integrity.

---

## Deployment & Testing

### Files Modified
- **New Migration**: `prisma/migrations/20260422000000_add_procedures_triggers_transactions/migration.sql`
  - 400+ lines of SQL defining procedures and triggers
  - Includes error handling and constraint validation
  - Compatible with Prisma migration system

### Execution
```bash
# Apply migration using Prisma
npx prisma migrate deploy

# Or during development with automatic generation
npx prisma migrate dev --name "add_procedures_triggers_transactions"
```

### Verification
Stored procedures can be tested using standard SQL:

```sql
-- Test account activation
SELECT * FROM activate_user_account(1);

-- Test subscription renewal
SELECT * FROM renew_subscription(1);

-- Test referral discount
SELECT * FROM apply_referral_discount(1, 25, 30);

-- Test invitation redemption
SELECT * FROM redeem_invitation('INVITE_CODE_123', 2);
```

Triggers execute automatically on table modifications, with validation errors raised when constraints are violated.

---

## Database Access Control

### Role-Based Access
Three database roles provide layered access control:

**streamflix_junior_role**
- Access: SELECT on `employee_user_basic` and `employee_profile_basic` views
- Use Case: Junior employees requiring read-only access to user and profile data

**streamflix_mid_role**
- Access: SELECT on employee views + UPDATE permissions on specific columns
  - User: `isActive` only
  - Profile: `name`, `ageCategory` only
- Use Case: Mid-level staff managing user accounts and profile information

**streamflix_senior_role**
- Access: Full CRUD on all tables and sequences
- Use Case: Senior administrators and backend applications requiring complete database access

### Procedure-Level Authorization
Individual procedures have execution permissions that can be granted to specific roles:

```sql
GRANT EXECUTE ON FUNCTION activate_user_account TO streamflix_mid_role;
GRANT EXECUTE ON FUNCTION deactivate_user_account TO streamflix_mid_role;
GRANT EXECUTE ON FUNCTION renew_subscription TO streamflix_senior_role;
GRANT EXECUTE ON FUNCTION apply_referral_discount TO streamflix_senior_role;
GRANT EXECUTE ON FUNCTION redeem_invitation TO streamflix_senior_role;
```

This ensures that sensitive operations like discount application are restricted to authorized roles.

---

## Conclusion

This database implementation provides comprehensive data integrity through:

1. **Structural constraints** at the schema level (primary keys, foreign keys)
2. **Procedural enforcement** through stored procedures with validation
3. **Automatic enforcement** via triggers for audit trails and business rules
4. **Transactional safety** with documented isolation levels and ACID guarantees
5. **Role-based access control** limiting operations to appropriate personnel

The combination of these layers ensures that the database maintains consistent state across all operations, supports audit requirements, and prevents unauthorized data manipulation.
