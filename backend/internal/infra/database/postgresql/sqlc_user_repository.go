package db_postgresql

import (
	"context"
	"database/sql"

	"github.com/aleroxac/projetin/internal/entity"
	"github.com/aleroxac/projetin/internal/infra/database/postgresql/sqlc"
	"github.com/google/uuid"
)

type SQLCUserRepository struct {
	db      *sql.DB
	queries *sqlc.Queries
}

func NewSQLCUserRepository(db *sql.DB) *SQLCUserRepository {
	return &SQLCUserRepository{
		db:      db,
		queries: sqlc.New(db),
	}
}

func (r *SQLCUserRepository) toEntity(u sqlc.User) *entity.User {
	return &entity.User{
		ID:            u.ID,
		Name:          u.Name,
		Email:         u.Email,
		BiologicalSex: u.BiologicalSex,
		BirthDate:     u.BirthDate,
	}
}

func (r *SQLCUserRepository) Create(ctx context.Context, u *entity.User) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	qtx := r.queries.WithTx(tx)

	created, err := qtx.CreateUser(ctx, sqlc.CreateUserParams{
		Name:          u.Name,
		Email:         u.Email,
		BiologicalSex: u.BiologicalSex,
		BirthDate:     u.BirthDate,
	})
	if err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	u.ID = created.ID
	return nil
}

func (r *SQLCUserRepository) GetByID(ctx context.Context, id uuid.UUID) (*entity.User, error) {
	dbUser, err := r.queries.GetUserById(ctx, id)
	if err != nil {
		return nil, err
	}

	return r.toEntity(dbUser), nil
}

func (r *SQLCUserRepository) List(ctx context.Context) ([]*entity.User, error) {
	dbUsers, err := r.queries.ListUsers(ctx)
	if err != nil {
		return nil, err
	}

	var users []*entity.User
	for _, u := range dbUsers {
		users = append(users, r.toEntity(u))
	}
	return users, nil
}

func (r *SQLCUserRepository) Update(ctx context.Context, id uuid.UUID, u *entity.User) error {
	_, err := r.queries.UpdateUser(ctx, sqlc.UpdateUserParams{
		ID:            id,
		Name:          u.Name,
		Email:         u.Email,
		BiologicalSex: u.BiologicalSex,
		BirthDate:     u.BirthDate,
	})
	return err
}

func (r *SQLCUserRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.queries.SoftDeleteUser(ctx, id)
}
