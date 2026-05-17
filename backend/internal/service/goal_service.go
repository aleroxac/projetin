package service

import (
	"context"

	"github.com/aleroxac/projetin/internal/dto"
	"github.com/aleroxac/projetin/internal/entity"
	"github.com/google/uuid"
)

type GoalRepository interface {
	Create(ctx context.Context, goal *entity.Goal) error
	GetByID(ctx context.Context, id uuid.UUID) (*entity.Goal, error)
	List(ctx context.Context, projectID uuid.UUID) ([]*entity.Goal, error)
	Update(ctx context.Context, id uuid.UUID, goal *entity.Goal) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type GoalService struct {
	Repo GoalRepository
}

func NewGoalService(repo GoalRepository) *GoalService {
	return &GoalService{Repo: repo}
}

func (s *GoalService) Create(ctx context.Context, input dto.CreateGoalInputDTO) (*entity.Goal, error) {
	goal, err := entity.NewGoal(input.ProjectID, input.Name, input.StrategyType)
	if err != nil {
		return nil, err
	}
	if err := s.Repo.Create(ctx, goal); err != nil {
		return nil, err
	}
	return goal, nil
}

func (s *GoalService) GetByID(ctx context.Context, id string) (*entity.Goal, error) {
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return nil, err
	}
	return s.Repo.GetByID(ctx, parsedID)
}

func (s *GoalService) List(ctx context.Context, projectID uuid.UUID) ([]*entity.Goal, error) {
	return s.Repo.List(ctx, projectID)
}

func (s *GoalService) Update(ctx context.Context, id string, input dto.UpdateGoalInputDTO) error {
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return err
	}
	goal, err := s.Repo.GetByID(ctx, parsedID)
	if err != nil {
		return err
	}
	if err := goal.UpdatePartial(input.Name, input.StrategyType, input.IsActive); err != nil {
		return err
	}
	return s.Repo.Update(ctx, parsedID, goal)
}

func (s *GoalService) Delete(ctx context.Context, id string) error {
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return err
	}
	return s.Repo.Delete(ctx, parsedID)
}
