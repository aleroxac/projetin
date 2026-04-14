package db_postgresql

import (
	"context"
	"database/sql"
	"encoding/json"

	"github.com/aleroxac/projetin/internal/entity"
	"github.com/aleroxac/projetin/internal/infra/database/postgresql/sqlc"
	"github.com/google/uuid"
)

type SQLCMacroEstimationRepository struct {
	db      *sql.DB
	queries *sqlc.Queries
}

func NewSQLCMacroEstimationRepository(db *sql.DB) *SQLCMacroEstimationRepository {
	return &SQLCMacroEstimationRepository{
		db:      db,
		queries: sqlc.New(db),
	}
}

func (r *SQLCMacroEstimationRepository) toEntity(row sqlc.MacroEstimation) (*entity.MacroEstimation, error) {
	var items []entity.MealItem
	if len(row.MealItems) > 0 {
		if err := json.Unmarshal(row.MealItems, &items); err != nil {
			return nil, err
		}
	}
	return &entity.MacroEstimation{
		ID:              row.ID,
		UserID:          row.UserID,
		MealDescription: row.MealDescription,
		MealItems:       items,
	}, nil
}

func (r *SQLCMacroEstimationRepository) Create(ctx context.Context, e *entity.MacroEstimation) error {
	itemsJSON, err := json.Marshal(e.MealItems)
	if err != nil {
		return err
	}
	result, err := r.queries.CreateMacroEstimation(ctx, sqlc.CreateMacroEstimationParams{
		UserID:          e.UserID,
		MealDescription: e.MealDescription,
		MealItems:       itemsJSON,
	})
	if err != nil {
		return err
	}
	e.ID = result.ID
	return nil
}

func (r *SQLCMacroEstimationRepository) GetByID(ctx context.Context, id uuid.UUID) (*entity.MacroEstimation, error) {
	row, err := r.queries.GetMacroEstimationById(ctx, id)
	if err != nil {
		return nil, err
	}
	return r.toEntity(row)
}

func (r *SQLCMacroEstimationRepository) List(ctx context.Context, userID uuid.UUID) ([]*entity.MacroEstimation, error) {
	rows, err := r.queries.ListMacroEstimationsByUser(ctx, userID)
	if err != nil {
		return nil, err
	}
	result := make([]*entity.MacroEstimation, 0, len(rows))
	for _, row := range rows {
		e, err := r.toEntity(row)
		if err != nil {
			return nil, err
		}
		result = append(result, e)
	}
	return result, nil
}

func (r *SQLCMacroEstimationRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.queries.SoftDeleteMacroEstimation(ctx, id)
}
