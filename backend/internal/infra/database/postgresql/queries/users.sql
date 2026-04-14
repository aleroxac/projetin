-- name: CreateUser :one
INSERT INTO users (name, email, biological_sex, birth_date)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: ListUsers :many
SELECT * FROM users
WHERE deleted_at IS NULL
ORDER BY name ASC;

-- name: GetUserById :one
SELECT * FROM users
WHERE id = $1 AND deleted_at IS NULL;

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = $1 AND deleted_at IS NULL;

-- name: GetUserByName :one
SELECT * FROM users
WHERE name = $1 AND deleted_at IS NULL;

-- name: UpdateUser :one
UPDATE users
SET
    name = $2,
    email = $3,
    biological_sex = $4,
    birth_date = $5,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1 AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteUser :exec
UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL;
