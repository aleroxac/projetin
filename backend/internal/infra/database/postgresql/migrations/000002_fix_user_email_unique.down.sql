DROP INDEX IF EXISTS idx_unique_email_per_user;

ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
