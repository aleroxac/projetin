package db_postgresql

import (
	"context"
	"database/sql"

	"github.com/aleroxac/projetin/internal/entity"
	"github.com/aleroxac/projetin/internal/infra/database/postgresql/sqlc"
	"github.com/google/uuid"
)

type SQLCProtocolRepository struct {
	db      *sql.DB
	queries *sqlc.Queries
}

func NewSQLCProtocolRepository(db *sql.DB) *SQLCProtocolRepository {
	return &SQLCProtocolRepository{
		db:      db,
		queries: sqlc.New(db),
	}
}

func (r *SQLCProtocolRepository) toEntity(p sqlc.Protocol) *entity.Protocol {
	return &entity.Protocol{
		ID:       p.ID,
		GoalID:   p.GoalID,
		Name:     p.Name,
		IsActive: p.IsActive.Bool,
	}
}

func (r *SQLCProtocolRepository) Create(ctx context.Context, p *entity.Protocol) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = r.queries.WithTx(tx).CreateProtocol(ctx, sqlc.CreateProtocolParams{
		GoalID: p.GoalID,
		Name:   p.Name,
	})
	if err != nil {
		return err
	}
	return tx.Commit()
}

func (r *SQLCProtocolRepository) GetByID(ctx context.Context, id uuid.UUID) (*entity.Protocol, error) {
	p, err := r.queries.GetProtocolById(ctx, id)
	if err != nil {
		return nil, err
	}
	return r.toEntity(p), nil
}

func (r *SQLCProtocolRepository) List(ctx context.Context, goalID uuid.UUID) ([]*entity.Protocol, error) {
	rows, err := r.queries.ListProtocolsByGoal(ctx, goalID)
	if err != nil {
		return nil, err
	}
	protocols := make([]*entity.Protocol, len(rows))
	for i, p := range rows {
		protocols[i] = r.toEntity(p)
	}
	return protocols, nil
}

func (r *SQLCProtocolRepository) Update(ctx context.Context, id uuid.UUID, p *entity.Protocol) error {
	_, err := r.queries.UpdateProtocol(ctx, sqlc.UpdateProtocolParams{
		ID:       id,
		Name:     p.Name,
		IsActive: sql.NullBool{Bool: p.IsActive, Valid: true},
	})
	return err
}

func (r *SQLCProtocolRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.queries.SoftDeleteProtocol(ctx, id)
}
