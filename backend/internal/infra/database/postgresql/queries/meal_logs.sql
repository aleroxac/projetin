-- name: CreateMealLog :one
INSERT INTO meal_logs (user_id, meal_title, meal_description, meal_items)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: ListMealLogsByUser :many
SELECT * FROM meal_logs
WHERE user_id = $1 AND deleted_at IS NULL
ORDER BY created_at DESC;

-- name: GetMealLogById :one
SELECT * FROM meal_logs
WHERE id = $1 AND deleted_at IS NULL;

-- name: UpdateMealLog :one
UPDATE meal_logs
SET
    meal_title = $2,
    meal_description = $3,
    meal_items = $4,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1 AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteMealLog :exec
UPDATE meal_logs SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL;
