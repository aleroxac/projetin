-- name: CreateProject :one
INSERT INTO projects (user_id, name)
VALUES ($1, $2)
RETURNING *;

-- name: ListProjectsByUser :many
SELECT * FROM projects
WHERE user_id = $1 AND deleted_at IS NULL
ORDER BY created_at DESC;

-- name: GetProjectById :one
SELECT * FROM projects
WHERE id = $1 AND deleted_at IS NULL;

-- name: UpdateProject :one
UPDATE projects
SET
    name = $2,
    is_active = $3,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1 AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteProject :exec
UPDATE projects SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL;
