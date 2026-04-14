-- name: CreateDietPlan :one
INSERT INTO diet_plans (protocol_id, calorie_intensity, protein_intensity, fat_intensity, protein, carbs, fat, calories, water)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING *;

-- name: ListDietPlansByProtocol :many
SELECT * FROM diet_plans
WHERE protocol_id = $1 AND deleted_at IS NULL
ORDER BY created_at DESC;

-- name: GetDietPlanById :one
SELECT * FROM diet_plans
WHERE id = $1 AND deleted_at IS NULL;

-- name: UpdateDietPlan :one
UPDATE diet_plans
SET
    calorie_intensity = $2,
    protein_intensity = $3,
    fat_intensity    = $4,
    protein   = $5,
    carbs     = $6,
    fat       = $7,
    calories  = $8,
    water     = $9,
    is_active = $10,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1 AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteDietPlan :exec
UPDATE diet_plans SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL;
