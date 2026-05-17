package db_postgresql

import (
	"context"
	"database/sql"

	"github.com/aleroxac/projetin/internal/entity"
	"github.com/aleroxac/projetin/internal/infra/database/postgresql/sqlc"
	"github.com/google/uuid"
)

type SQLCDietPlanRepository struct {
	db      *sql.DB
	queries *sqlc.Queries
}

func NewSQLCDietPlanRepository(db *sql.DB) *SQLCDietPlanRepository {
	return &SQLCDietPlanRepository{
		db:      db,
		queries: sqlc.New(db),
	}
}

func (r *SQLCDietPlanRepository) toEntity(d sqlc.DietPlan) *entity.DietPlan {
	return &entity.DietPlan{
		ID:               d.ID,
		ProtocolID:       d.ProtocolID,
		CalorieIntensity: entity.DietIntensity(d.CalorieIntensity),
		ProteinIntensity: entity.DietIntensity(d.ProteinIntensity),
		FatIntensity:    entity.DietIntensity(d.FatIntensity),
		Protein:          d.Protein,
		Carbs:            d.Carbs,
		Fat:              d.Fat,
		Calories:         d.Calories,
		Water:            d.Water,
		IsActive:         d.IsActive.Bool,
	}
}

func (r *SQLCDietPlanRepository) Create(ctx context.Context, d *entity.DietPlan) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	created, err := r.queries.WithTx(tx).CreateDietPlan(ctx, sqlc.CreateDietPlanParams{
		ProtocolID:       d.ProtocolID,
		CalorieIntensity: string(d.CalorieIntensity),
		ProteinIntensity: string(d.ProteinIntensity),
		FatIntensity:    string(d.FatIntensity),
		Protein:          d.Protein,
		Carbs:            d.Carbs,
		Fat:              d.Fat,
		Calories:         d.Calories,
		Water:            d.Water,
	})
	if err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	d.ID = created.ID
	return nil
}

func (r *SQLCDietPlanRepository) GetByID(ctx context.Context, id uuid.UUID) (*entity.DietPlan, error) {
	d, err := r.queries.GetDietPlanById(ctx, id)
	if err != nil {
		return nil, err
	}
	return r.toEntity(d), nil
}

func (r *SQLCDietPlanRepository) List(ctx context.Context, protocolID uuid.UUID) ([]*entity.DietPlan, error) {
	rows, err := r.queries.ListDietPlansByProtocol(ctx, protocolID)
	if err != nil {
		return nil, err
	}
	plans := make([]*entity.DietPlan, len(rows))
	for i, d := range rows {
		plans[i] = r.toEntity(d)
	}
	return plans, nil
}

func (r *SQLCDietPlanRepository) Update(ctx context.Context, id uuid.UUID, d *entity.DietPlan) error {
	_, err := r.queries.UpdateDietPlan(ctx, sqlc.UpdateDietPlanParams{
		ID:               id,
		CalorieIntensity: string(d.CalorieIntensity),
		ProteinIntensity: string(d.ProteinIntensity),
		FatIntensity:    string(d.FatIntensity),
		Protein:          d.Protein,
		Carbs:            d.Carbs,
		Fat:              d.Fat,
		Calories:         d.Calories,
		Water:            d.Water,
		IsActive:         sql.NullBool{Bool: d.IsActive, Valid: true},
	})
	return err
}

func (r *SQLCDietPlanRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.queries.SoftDeleteDietPlan(ctx, id)
}
