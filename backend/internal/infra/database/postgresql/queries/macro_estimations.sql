-- name: CreateMacroEstimation :one
INSERT INTO macro_estimations (user_id, meal_description, meal_items)
VALUES ($1, $2, $3)
RETURNING *;

-- name: ListMacroEstimationsByUser :many
SELECT * FROM macro_estimations
WHERE user_id = $1 AND deleted_at IS NULL
ORDER BY created_at DESC;

-- name: GetMacroEstimationById :one
SELECT * FROM macro_estimations
WHERE id = $1 AND deleted_at IS NULL;

-- name: SoftDeleteMacroEstimation :exec
UPDATE macro_estimations SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL;
