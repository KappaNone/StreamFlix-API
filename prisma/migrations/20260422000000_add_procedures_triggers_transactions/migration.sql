-- =====================================================
-- STORED PROCEDURES
-- =====================================================

-- Procedure 1: User Account Management
CREATE OR REPLACE FUNCTION activate_user_account(user_id INT)
RETURNS TABLE(id INT, email TEXT, isActive BOOLEAN, updated_at TIMESTAMP)
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE "User"
  SET "isActive" = true, "updatedAt" = NOW()
  WHERE "id" = user_id;
  
  RETURN QUERY
  SELECT u."id", u."email", u."isActive", u."updatedAt"
  FROM "User" u
  WHERE u."id" = user_id;
END;
$$;

CREATE OR REPLACE FUNCTION deactivate_user_account(user_id INT)
RETURNS TABLE(id INT, email TEXT, isActive BOOLEAN, updated_at TIMESTAMP)
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE "User"
  SET "isActive" = false, "updatedAt" = NOW()
  WHERE "id" = user_id;
  
  RETURN QUERY
  SELECT u."id", u."email", u."isActive", u."updatedAt"
  FROM "User" u
  WHERE u."id" = user_id;
END;
$$;

-- Procedure 2: Subscription Renewal
CREATE OR REPLACE FUNCTION renew_subscription(subscription_id INT)
RETURNS TABLE(id INT, user_id INT, status TEXT, period_start TIMESTAMP, period_end TIMESTAMP)
LANGUAGE plpgsql
AS $$
DECLARE
  v_plan_id INT;
  v_trial_days INT;
BEGIN
  -- Fetch subscription and plan details
  SELECT s."planId" INTO v_plan_id
  FROM "Subscription" s
  WHERE s."id" = subscription_id;
  
  IF v_plan_id IS NULL THEN
    RAISE EXCEPTION 'Subscription not found: %', subscription_id;
  END IF;
  
  -- Update subscription with new period
  UPDATE "Subscription"
  SET 
    "status" = 'ACTIVE',
    "currentPeriodStart" = NOW(),
    "currentPeriodEnd" = NOW() + INTERVAL '30 days',
    "updatedAt" = NOW()
  WHERE "id" = subscription_id;
  
  RETURN QUERY
  SELECT 
    s."id", 
    s."userId", 
    s."status"::TEXT,
    s."currentPeriodStart",
    s."currentPeriodEnd"
  FROM "Subscription" s
  WHERE s."id" = subscription_id;
END;
$$;

-- Procedure 3: Apply Referral Discount
CREATE OR REPLACE FUNCTION apply_referral_discount(subscription_id INT, discount_percent INT, duration_days INT)
RETURNS TABLE(id INT, discount_pct INT, discount_ends TIMESTAMP)
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id INT;
BEGIN
  -- Validate discount hasn't been used
  SELECT s."userId" INTO v_user_id
  FROM "Subscription" s
  WHERE s."id" = subscription_id;
  
  IF EXISTS (
    SELECT 1 FROM "User" u
    WHERE u."id" = v_user_id AND u."referralDiscountUsed" = true
  ) THEN
    RAISE EXCEPTION 'User has already used referral discount';
  END IF;
  
  -- Apply discount to subscription
  UPDATE "Subscription"
  SET 
    "discountPercent" = discount_percent,
    "discountEndsAt" = NOW() + (duration_days || ' days')::INTERVAL,
    "updatedAt" = NOW()
  WHERE "id" = subscription_id;
  
  -- Mark user as having used discount
  UPDATE "User"
  SET "referralDiscountUsed" = true
  WHERE "id" = v_user_id;
  
  RETURN QUERY
  SELECT 
    s."id",
    s."discountPercent",
    s."discountEndsAt"
  FROM "Subscription" s
  WHERE s."id" = subscription_id;
END;
$$;

-- Procedure 4: Handle Invitation Redemption (Multi-step transaction)
CREATE OR REPLACE FUNCTION redeem_invitation(invitation_code TEXT, user_id INT)
RETURNS TABLE(invitation_id INT, subscription_id INT, discount_applied INT, status TEXT)
LANGUAGE plpgsql
AS $$
DECLARE
  v_invitation_id INT;
  v_subscription_id INT;
  v_discount_percent INT;
  v_discount_days INT;
  v_inviter_id INT;
BEGIN
  -- Fetch invitation details
  SELECT i."id", i."inviterId", i."discountPercent", i."discountDurationDays"
  INTO v_invitation_id, v_inviter_id, v_discount_percent, v_discount_days
  FROM "Invitation" i
  WHERE i."code" = invitation_code
    AND i."status" = 'PENDING'
    AND i."expiresAt" > NOW();
  
  IF v_invitation_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invitation code';
  END IF;
  
  -- Get the inviter's active subscription to link
  SELECT s."id" INTO v_subscription_id
  FROM "Subscription" s
  JOIN "User" u ON u."id" = s."userId"
  WHERE u."id" = v_inviter_id AND s."status" = 'ACTIVE'
  LIMIT 1;
  
  IF v_subscription_id IS NULL THEN
    RAISE EXCEPTION 'Inviter has no active subscription';
  END IF;
  
  -- Update invitation status
  UPDATE "Invitation"
  SET 
    "status" = 'REDEEMED',
    "redeemedAt" = NOW(),
    "subscriptionId" = v_subscription_id,
    "updatedAt" = NOW()
  WHERE "id" = v_invitation_id;
  
  -- Apply discount to user's subscription (if they have one)
  UPDATE "Subscription"
  SET
    "discountPercent" = v_discount_percent,
    "discountEndsAt" = NOW() + (v_discount_days || ' days')::INTERVAL,
    "updatedAt" = NOW()
  WHERE "id" = (
    SELECT "id" FROM "Subscription"
    WHERE "userId" = user_id AND "status" = 'ACTIVE'
    LIMIT 1
  );
  
  RETURN QUERY
  SELECT 
    v_invitation_id,
    v_subscription_id,
    v_discount_percent,
    'REDEEMED'::TEXT;
END;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger 1: Auto-update updatedAt on User table
CREATE OR REPLACE FUNCTION update_user_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_update_timestamp ON "User";
CREATE TRIGGER user_update_timestamp
BEFORE UPDATE ON "User"
FOR EACH ROW
EXECUTE FUNCTION update_user_timestamp();

-- Trigger 2: Auto-update updatedAt on Profile table
CREATE OR REPLACE FUNCTION update_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profile_update_timestamp ON "Profile";
CREATE TRIGGER profile_update_timestamp
BEFORE UPDATE ON "Profile"
FOR EACH ROW
EXECUTE FUNCTION update_profile_timestamp();

-- Trigger 3: Auto-update updatedAt on Subscription table
CREATE OR REPLACE FUNCTION update_subscription_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS subscription_update_timestamp ON "Subscription";
CREATE TRIGGER subscription_update_timestamp
BEFORE UPDATE ON "Subscription"
FOR EACH ROW
EXECUTE FUNCTION update_subscription_timestamp();

-- Trigger 4: Validate subscription period logic
CREATE OR REPLACE FUNCTION validate_subscription_period()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."currentPeriodEnd" <= NEW."currentPeriodStart" THEN
    RAISE EXCEPTION 'Subscription period end must be after start';
  END IF;
  
  IF NEW."status" = 'ACTIVE' AND NEW."currentPeriodEnd" < NOW() THEN
    RAISE EXCEPTION 'Cannot set active status with expired period';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS subscription_validate_period ON "Subscription";
CREATE TRIGGER subscription_validate_period
BEFORE INSERT OR UPDATE ON "Subscription"
FOR EACH ROW
EXECUTE FUNCTION validate_subscription_period();

-- Trigger 5: Enforce referral discount rules
CREATE OR REPLACE FUNCTION enforce_referral_discount_rules()
RETURNS TRIGGER AS $$
DECLARE
  v_used_discount BOOLEAN;
BEGIN
  -- Only validate if discount is being applied
  IF NEW."discountPercent" > 0 THEN
    SELECT "referralDiscountUsed" INTO v_used_discount
    FROM "User"
    WHERE "id" = NEW."userId";
    
    IF v_used_discount = true THEN
      RAISE EXCEPTION 'User has already used referral discount allocation';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS subscription_referral_rules ON "Subscription";
CREATE TRIGGER subscription_referral_rules
BEFORE INSERT ON "Subscription"
FOR EACH ROW
EXECUTE FUNCTION enforce_referral_discount_rules();

-- =====================================================
-- TRANSACTION EXAMPLE & DOCUMENTATION
-- =====================================================

-- This is an example of a complete transaction that demonstrates ACID properties:
-- 
-- TRANSACTION SCENARIO: New User Registration with Subscription & Profile
-- 
-- Isolation Level Used: READ_COMMITTED (PostgreSQL default)
-- Justification:
--   - Sufficient for most SaaS scenarios (prevents dirty reads)
--   - Allows concurrent user registrations without locking entire user table
--   - Acceptable performance overhead vs. complete isolation
--   - Financial operations (subscription) benefit from consistency checks
--
-- EXAMPLE TRANSACTION (NOT automatically executed):
--
-- BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;
--   -- Step 1: Create user account
--   INSERT INTO "User" (email, password, "isActive", "createdAt", "updatedAt")
--   VALUES ('newuser@example.com', '$hashed_password$', true, NOW(), NOW())
--   RETURNING id INTO user_id;
--   
--   -- Step 2: Create user profile with age category
--   INSERT INTO "Profile" (name, "ageCategory", "userId")
--   VALUES ('Main Profile', 'ADULT', user_id)
--   RETURNING id INTO profile_id;
--   
--   -- Step 3: Create subscription with trial
--   INSERT INTO "Subscription" (
--     "userId", "planId", "status", 
--     "currentPeriodStart", "currentPeriodEnd", "trialEndsAt",
--     "autoRenew", "createdAt", "updatedAt"
--   ) VALUES (
--     user_id, 1, 'ACTIVE',
--     NOW(), NOW() + INTERVAL '30 days', NOW() + INTERVAL '7 days',
--     true, NOW(), NOW()
--   )
--   RETURNING id INTO subscription_id;
--   
--   -- Step 4: Create profile preferences
--   INSERT INTO "ProfilePreference" ("profileId", "createdAt", "updatedAt")
--   VALUES (profile_id, NOW(), NOW());
--   
-- COMMIT;
--
-- ROLLBACK SCENARIO (if any step fails):
-- If any INSERT fails (e.g., duplicate email), entire transaction rolls back.
-- No orphaned profiles, subscriptions, or partial user accounts are created.
--
-- This demonstrates:
--   ✓ Atomicity: All-or-nothing - complete registration or nothing
--   ✓ Consistency: Foreign key constraints enforced throughout
--   ✓ Isolation: READ_COMMITTED prevents interference from concurrent registrations
--   ✓ Durability: Once committed, survives system failures

-- Grant procedure execute permissions to application role (if exists)
-- NOTE: Create an application-level user role and grant as follows:
-- GRANT EXECUTE ON FUNCTION activate_user_account TO app_user;
-- GRANT EXECUTE ON FUNCTION deactivate_user_account TO app_user;
-- GRANT EXECUTE ON FUNCTION renew_subscription TO app_user;
-- GRANT EXECUTE ON FUNCTION apply_referral_discount TO app_user;
-- GRANT EXECUTE ON FUNCTION redeem_invitation TO app_user;
