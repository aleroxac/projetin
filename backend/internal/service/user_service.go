package service

import (
	"context"
	"time"

	dto "github.com/aleroxac/projetin/internal/dto"
	"github.com/aleroxac/projetin/internal/entity"
	"github.com/google/uuid"
)

type UserRepository interface {
	Create(ctx context.Context, user *entity.User) error
	GetByID(ctx context.Context, id uuid.UUID) (*entity.User, error)
	List(ctx context.Context) ([]*entity.User, error)
	Update(ctx context.Context, id uuid.UUID, user *entity.User) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type UserService struct {
	UserRepo UserRepository
}

func NewUserService(repo UserRepository) *UserService {
	return &UserService{UserRepo: repo}
}

func (uc *UserService) Create(ctx context.Context, input dto.CreateUserInputDTO) error {
	birthDate := time.Time(input.BirthDate)

	user, err := entity.NewUser(input.Name, input.Email, input.BiologicalSex, birthDate)
	if err != nil {
		return err
	}

	return uc.UserRepo.Create(ctx, user)
}

func (uc *UserService) GetByID(ctx context.Context, id string) (*entity.User, error) {
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return nil, err
	}
	return uc.UserRepo.GetByID(ctx, parsedID)
}

func (uc *UserService) List(ctx context.Context) ([]*entity.User, error) {
	return uc.UserRepo.List(ctx)
}

func (uc *UserService) Update(ctx context.Context, id string, input dto.UpdateUserInputDTO) error {
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return err
	}
	user, err := uc.UserRepo.GetByID(ctx, parsedID)
	if err != nil {
		return err
	}

	var bDate *time.Time
	if input.BirthDate != nil {
		t := time.Time(*input.BirthDate)
		bDate = &t
	}

	err = user.UpdatePartial(input.Name, input.Email, input.BiologicalSex, bDate)
	if err != nil {
		return err
	}

	return uc.UserRepo.Update(ctx, parsedID, user)
}

func (uc *UserService) Delete(ctx context.Context, id string) error {
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return err
	}

	err = uc.UserRepo.Delete(ctx, parsedID)
	if err != nil {
		return err
	}

	return err
}
