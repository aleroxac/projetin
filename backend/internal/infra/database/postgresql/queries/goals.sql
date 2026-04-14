-- name: CreateGoal :one
INSERT INTO goals (project_id, name, strategy_type)
VALUES ($1, $2, $3)
RETURNING *;

-- name: ListGoalsByProject :many
SELECT * FROM goals
WHERE project_id = $1 AND deleted_at IS NULL
ORDER BY created_at DESC;

-- name: GetGoalById :one
SELECT * FROM goals
WHERE id = $1 AND deleted_at IS NULL;

-- name: UpdateGoal :one
UPDATE goals
SET
    name = $2,
    strategy_type = $3,
    is_active = $4,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1 AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteGoal :exec
UPDATE goals SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL;
