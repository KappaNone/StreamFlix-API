-- Mid-level employees have column-level UPDATE rights, but they also need to be able
-- to target rows (e.g., via WHERE id = ...). PostgreSQL may require SELECT rights
-- on the columns used in predicates.

GRANT SELECT ("id", "email") ON "User" TO streamflix_mid_role;
GRANT SELECT ("id", "userId") ON "Profile" TO streamflix_mid_role;
