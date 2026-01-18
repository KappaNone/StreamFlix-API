-- Add isActive field used for DBMS-only account activation/deactivation
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

-- =====================================================
-- Internal employees (DBMS-only) roles and access model
-- =====================================================

-- Roles (no login)
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

-- NOTE:
-- We intentionally do NOT create LOGIN users here (no hardcoded passwords in repo).
-- Create login users manually in your DBMS and grant them the role(s), e.g.:
--   CREATE ROLE streamflix_junior LOGIN PASSWORD '...';
--   GRANT streamflix_junior_role TO streamflix_junior;

-- Allow connecting to the current database
DO $$
BEGIN
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO streamflix_junior_role', current_database());
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO streamflix_mid_role', current_database());
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO streamflix_senior_role', current_database());
END
$$;

GRANT USAGE ON SCHEMA public TO streamflix_junior_role, streamflix_mid_role, streamflix_senior_role;

-- Views for limited read access
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

-- Junior employees: read-only basic account/profile info
GRANT SELECT ON public.employee_user_basic TO streamflix_junior_role;
GRANT SELECT ON public.employee_profile_basic TO streamflix_junior_role;

-- Mid-level employees: same reads + limited updates (no financial data)
GRANT SELECT ON public.employee_user_basic TO streamflix_mid_role;
GRANT SELECT ON public.employee_profile_basic TO streamflix_mid_role;

GRANT UPDATE ("isActive") ON "User" TO streamflix_mid_role;
GRANT UPDATE ("name", "ageCategory") ON "Profile" TO streamflix_mid_role;

-- Senior employees: full access to all tables (includes subscriptions + viewing history)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO streamflix_senior_role;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO streamflix_senior_role;
