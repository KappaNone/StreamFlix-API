-- =====================================================
-- StreamFlix User Roles Setup
-- =====================================================
-- Run this to set up database roles for internal employees

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'streamflix_junior_role') THEN
    CREATE ROLE streamflix_junior_role NOLOGIN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'streamflix_mid_role') THEN
    CREATE ROLE streamflix_mid_role NOLOGIN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'streamflix_senior_role') THEN
    CREATE ROLE streamflix_senior_role NOLOGIN;
  END IF;
END
$$;

-- =====================================================
-- Database and Schema Access
-- =====================================================

-- Allow connecting to the current database
DO $$
BEGIN
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO streamflix_junior_role', current_database());
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO streamflix_mid_role', current_database());
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO streamflix_senior_role', current_database());
END
$$;

GRANT USAGE ON SCHEMA public TO streamflix_junior_role, streamflix_mid_role, streamflix_senior_role;

-- =====================================================
-- Views for Limited Read Access
-- =====================================================

CREATE OR REPLACE VIEW public.employee_user_basic AS
SELECT
  "id",
  "email",
  "name",
  "emailVerified",
  "failedLoginAttempts",
  "accountLockedUntil",
  "isActive",
  "createdAt",
  "updatedAt"
FROM "User";

CREATE OR REPLACE VIEW public.employee_profile_basic AS
SELECT
  p."id" AS "profileId",
  p."name" AS "profileName",
  p."ageCategory",
  p."userId",
  u."email" AS "userEmail"
FROM "Profile" p
JOIN "User" u ON u."id" = p."userId";

-- =====================================================
-- Permissions by Role Level
-- =====================================================

-- Junior employees: read-only basic account/profile info
GRANT SELECT ON public.employee_user_basic TO streamflix_junior_role;
GRANT SELECT ON public.employee_profile_basic TO streamflix_junior_role;

-- Mid-level employees: same reads + limited updates (no financial data)
GRANT SELECT ON public.employee_user_basic TO streamflix_mid_role;
GRANT SELECT ON public.employee_profile_basic TO streamflix_mid_role;

-- Allow mid-level role to locate rows for permitted updates
GRANT SELECT ("id") ON "User" TO streamflix_mid_role;
GRANT SELECT ("id") ON "Profile" TO streamflix_mid_role;

-- Limited update permissions for mid-level employees
GRANT UPDATE ("isActive") ON "User" TO streamflix_mid_role;
GRANT UPDATE ("name", "ageCategory") ON "Profile" TO streamflix_mid_role;

-- Senior employees: full access to all tables (includes subscriptions + viewing history)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO streamflix_senior_role;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO streamflix_senior_role;

-- =====================================================
-- Notes
-- =====================================================
-- We intentionally do NOT create LOGIN users here (no hardcoded passwords in repo).