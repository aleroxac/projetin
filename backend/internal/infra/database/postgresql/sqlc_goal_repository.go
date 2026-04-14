package db_postgresql

import (
	"context"
	"database/sql"

	"github.com/aleroxac/projetin/internal/entity"
	"github.com/aleroxac/projetin/internal/infra/database/postgresql/sqlc"
	"github.com/google/uuid"
)

type SQLCGoalRepository struct {
	db      *sql.DB
	queries *sqlc.Queries
}

func NewSQLCGoalRepository(db *sql.DB) *SQLCGoalRepository {
	return &SQLCGoalRepository{
		db:      db,
		queries: sqlc.New(db),
	}
}

func (r *SQLCGoalRepository) toEntity(g sqlc.Goal) *entity.Goal {
	return &entity.Goal{
		ID:           g.ID,
		ProjectID:    g.ProjectID,
		Name:         g.Name,
		StrategyType: g.StrategyType,
		IsActive:     g.IsActive.Bool,
	}
}

func (r *SQLCGoalRepository) Create(ctx context.Context, g *entity.Goal) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = r.queries.WithTx(tx).CreateGoal(ctx, sqlc.CreateGoalParams{
		ProjectID:    g.ProjectID,
		Name:         g.Name,
		StrategyType: g.StrategyType,
	})
	if err != nil {
		return err
	}
	return tx.Commit()
}

func (r *SQLCGoalRepository) GetByID(ctx context.Context, id uuid.UUID) (*entity.Goal, error) {
	g, err := r.queries.GetGoalById(ctx, id)
	if err != nil {
		return nil, err
	}
	return r.toEntity(g), nil
}

func (r *SQLCGoalRepository) List(ctx context.Context, projectID uuid.UUID) ([]*entity.Goal, error) {
	rows, err := r.queries.ListGoalsByProject(ctx, projectID)
	if err != nil {
		return nil, err
	}
	goals := make([]*entity.Goal, len(rows))
	for i, g := range rows {
		goals[i] = r.toEntity(g)
	}
	return goals, nil
}

func (r *SQLCGoalRepository) Update(ctx context.Context, id uuid.UUID, g *entity.Goal) error {
	_, err := r.queries.UpdateGoal(ctx, sqlc.UpdateGoalParams{
		ID:           id,
		Name:         g.Name,
		StrategyType: g.StrategyType,
		IsActive:     sql.NullBool{Bool: g.IsActive, Valid: true},
	})
	return err
}

func (r *SQLCGoalRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.queries.SoftDeleteGoal(ctx, id)
}
