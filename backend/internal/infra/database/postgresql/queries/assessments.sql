-- name: CreateAssessment :one
INSERT INTO assessments (user_id, weight, height, body_fat, activity_level, bmi, bmr, tdee)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;

-- name: ListAssessmentsByUser :many
SELECT * FROM assessments
WHERE user_id = $1 AND deleted_at IS NULL
ORDER BY created_at DESC;

-- name: GetAssessmentById :one
SELECT * FROM assessments
WHERE id = $1 AND deleted_at IS NULL;

-- name: UpdateAssessment :one
UPDATE assessments
SET
    weight = $2,
    height = $3,
    body_fat = $4,
    activity_level = $5,
    bmi = $6,
    bmr = $7,
    tdee = $8,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1 AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteAssessment :exec
UPDATE assessments SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL;

-- name: GetLatestAssessmentByUserID :one
SELECT * FROM assessments
WHERE user_id = $1 AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 1;
