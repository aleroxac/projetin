-- Replace the simple UNIQUE constraint on users.email with a partial unique index
-- so that soft-deleted users do not block re-creation with the same email.
ALTER TABLE users DROP CONSTRAINT users_email_key;

CREATE UNIQUE INDEX idx_unique_email_per_user ON users(email) WHERE deleted_at IS NULL;
