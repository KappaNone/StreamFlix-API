-- Allow mid-level employee role to locate rows for permitted updates.
-- Postgres requires SELECT privileges on columns referenced in WHERE clauses.

GRANT SELECT ("id") ON "User" TO streamflix_mid_role;
GRANT SELECT ("id") ON "Profile" TO streamflix_mid_role;
