-- delete everything in the public schema
DROP SCHEMA public CASCADE;

-- recreate a clean schema
CREATE SCHEMA public;

-- restore normal permissions
GRANT ALL ON SCHEMA public TO public;
GRANT ALL ON SCHEMA public TO admin;

-- extension used for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;