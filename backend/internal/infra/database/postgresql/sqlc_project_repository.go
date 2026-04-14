package db_postgresql

import (
	"context"
	"database/sql"

	"github.com/aleroxac/projetin/internal/entity"
	"github.com/aleroxac/projetin/internal/infra/database/postgresql/sqlc"
	"github.com/google/uuid"
)

type SQLCProjectRepository struct {
	db      *sql.DB
	queries *sqlc.Queries
}

func NewSQLCProjectRepository(db *sql.DB) *SQLCProjectRepository {
	return &SQLCProjectRepository{
		db:      db,
		queries: sqlc.New(db),
	}
}

func (r *SQLCProjectRepository) toEntity(p sqlc.Project) *entity.Project {
	return &entity.Project{
		ID:       p.ID,
		UserID:   p.UserID,
		Name:     p.Name,
		IsActive: p.IsActive.Bool,
	}
}

func (r *SQLCProjectRepository) Create(ctx context.Context, p *entity.Project) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = r.queries.WithTx(tx).CreateProject(ctx, sqlc.CreateProjectParams{
		UserID: p.UserID,
		Name:   p.Name,
	})
	if err != nil {
		return err
	}
	return tx.Commit()
}

func (r *SQLCProjectRepository) GetByID(ctx context.Context, id uuid.UUID) (*entity.Project, error) {
	p, err := r.queries.GetProjectById(ctx, id)
	if err != nil {
		return nil, err
	}
	return r.toEntity(p), nil
}

func (r *SQLCProjectRepository) List(ctx context.Context, userID uuid.UUID) ([]*entity.Project, error) {
	rows, err := r.queries.ListProjectsByUser(ctx, userID)
	if err != nil {
		return nil, err
	}
	projects := make([]*entity.Project, len(rows))
	for i, p := range rows {
		projects[i] = r.toEntity(p)
	}
	return projects, nil
}

func (r *SQLCProjectRepository) Update(ctx context.Context, id uuid.UUID, p *entity.Project) error {
	_, err := r.queries.UpdateProject(ctx, sqlc.UpdateProjectParams{
		ID:       id,
		Name:     p.Name,
		IsActive: sql.NullBool{Bool: p.IsActive, Valid: true},
	})
	return err
}

func (r *SQLCProjectRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.queries.SoftDeleteProject(ctx, id)
}
