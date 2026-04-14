-- name: CreateProtocol :one
INSERT INTO protocols (goal_id, name)
VALUES ($1, $2)
RETURNING *;

-- name: ListProtocolsByGoal :many
SELECT * FROM protocols
WHERE goal_id = $1 AND deleted_at IS NULL
ORDER BY created_at DESC;

-- name: GetProtocolById :one
SELECT * FROM protocols
WHERE id = $1 AND deleted_at IS NULL;

-- name: UpdateProtocol :one
UPDATE protocols
SET
    name = $2,
    is_active = $3,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1 AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteProtocol :exec
UPDATE protocols SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL;
