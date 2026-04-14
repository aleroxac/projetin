package db_postgresql

import (
	"context"
	"database/sql"

	"github.com/aleroxac/projetin/internal/entity"
	"github.com/aleroxac/projetin/internal/infra/database/postgresql/sqlc"
	"github.com/google/uuid"
)

type SQLCAssessmentRepository struct {
	db      *sql.DB
	queries *sqlc.Queries
}

func NewSQLCAssessmentRepository(db *sql.DB) *SQLCAssessmentRepository {
	return &SQLCAssessmentRepository{
		db:      db,
		queries: sqlc.New(db),
	}
}

func (r *SQLCAssessmentRepository) toEntity(u sqlc.Assessment) *entity.Assessment {
	return &entity.Assessment{
		ID:            u.ID,
		UserID:        u.UserID,
		Weight:        u.Weight,
		Height:        u.Height,
		BodyFat:       u.BodyFat,
		ActivityLevel: u.ActivityLevel,
		BMI:           u.Bmi,
		BMR:           u.Bmr,
		TDEE:          u.Tdee,
		RecordedAt:    u.CreatedAt.Time,
	}
}

func (r *SQLCAssessmentRepository) Create(ctx context.Context, u *entity.Assessment) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	qtx := r.queries.WithTx(tx)

	_, err = qtx.CreateAssessment(ctx, sqlc.CreateAssessmentParams{
		UserID:        u.UserID,
		Weight:        u.Weight,
		Height:        u.Height,
		BodyFat:       u.BodyFat,
		ActivityLevel: u.ActivityLevel,
		Bmi:           u.BMI,
		Bmr:           u.BMR,
		Tdee:          u.TDEE,
	})
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (r *SQLCAssessmentRepository) GetByID(ctx context.Context, id uuid.UUID) (*entity.Assessment, error) {
	dbAssessment, err := r.queries.GetAssessmentById(ctx, id)
	if err != nil {
		return nil, err
	}

	return r.toEntity(dbAssessment), nil
}

func (r *SQLCAssessmentRepository) List(ctx context.Context, user_id uuid.UUID) ([]*entity.Assessment, error) {
	dbAssessments, err := r.queries.ListAssessmentsByUser(ctx, user_id)
	if err != nil {
		return nil, err
	}

	var assessments []*entity.Assessment
	for _, u := range dbAssessments {
		assessments = append(assessments, r.toEntity(u))
	}
	return assessments, nil
}

func (r *SQLCAssessmentRepository) Update(ctx context.Context, id uuid.UUID, u *entity.Assessment) error {
	_, err := r.queries.UpdateAssessment(ctx, sqlc.UpdateAssessmentParams{
		ID:            id,
		Weight:        u.Weight,
		Height:        u.Height,
		BodyFat:       u.BodyFat,
		ActivityLevel: u.ActivityLevel,
		Bmi:           u.BMI,
		Bmr:           u.BMR,
		Tdee:          u.TDEE,
	})
	return err
}

func (r *SQLCAssessmentRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.queries.SoftDeleteAssessment(ctx, id)
}

func (r *SQLCAssessmentRepository) GetLatestByUserID(ctx context.Context, userID uuid.UUID) (*entity.Assessment, error) {
	u, err := r.queries.GetLatestAssessmentByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	return r.toEntity(u), nil
}
