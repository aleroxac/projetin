package db_postgresql

import (
	"context"
	"database/sql"
	"encoding/json"

	"github.com/aleroxac/projetin/internal/entity"
	"github.com/aleroxac/projetin/internal/infra/database/postgresql/sqlc"
	"github.com/google/uuid"
)

type SQLCMealLogRepository struct {
	db      *sql.DB
	queries *sqlc.Queries
}

func NewSQLCMealLogRepository(db *sql.DB) *SQLCMealLogRepository {
	return &SQLCMealLogRepository{
		db:      db,
		queries: sqlc.New(db),
	}
}

func (r *SQLCMealLogRepository) toEntity(row sqlc.MealLog) (*entity.MealLog, error) {
	var items []entity.MealItem
	if len(row.MealItems) > 0 {
		if err := json.Unmarshal(row.MealItems, &items); err != nil {
			return nil, err
		}
	}
	return &entity.MealLog{
		ID:              row.ID,
		UserID:          row.UserID,
		MealTitle:       row.MealTitle,
		MealDescription: row.MealDescription,
		MealItems:       items,
		LoggedAt:        row.CreatedAt.Time,
	}, nil
}

func (r *SQLCMealLogRepository) Create(ctx context.Context, e *entity.MealLog) error {
	itemsJSON, err := json.Marshal(e.MealItems)
	if err != nil {
		return err
	}
	result, err := r.queries.CreateMealLog(ctx, sqlc.CreateMealLogParams{
		UserID:          e.UserID,
		MealTitle:       e.MealTitle,
		MealDescription: e.MealDescription,
		MealItems:       itemsJSON,
	})
	if err != nil {
		return err
	}
	e.ID = result.ID
	return nil
}

func (r *SQLCMealLogRepository) GetByID(ctx context.Context, id uuid.UUID) (*entity.MealLog, error) {
	row, err := r.queries.GetMealLogById(ctx, id)
	if err != nil {
		return nil, err
	}
	return r.toEntity(row)
}

func (r *SQLCMealLogRepository) List(ctx context.Context, userID uuid.UUID) ([]*entity.MealLog, error) {
	rows, err := r.queries.ListMealLogsByUser(ctx, userID)
	if err != nil {
		return nil, err
	}
	result := make([]*entity.MealLog, 0, len(rows))
	for _, row := range rows {
		e, err := r.toEntity(row)
		if err != nil {
			return nil, err
		}
		result = append(result, e)
	}
	return result, nil
}

func (r *SQLCMealLogRepository) Update(ctx context.Context, e *entity.MealLog) error {
	itemsJSON, err := json.Marshal(e.MealItems)
	if err != nil {
		return err
	}
	result, err := r.queries.UpdateMealLog(ctx, sqlc.UpdateMealLogParams{
		ID:              e.ID,
		MealTitle:       e.MealTitle,
		MealDescription: e.MealDescription,
		MealItems:       itemsJSON,
	})
	if err != nil {
		return err
	}
	e.ID = result.ID
	return nil
}

func (r *SQLCMealLogRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.queries.SoftDeleteMealLog(ctx, id)
}
