package service

import (
	"context"

	"github.com/aleroxac/projetin/internal/dto"
	"github.com/aleroxac/projetin/internal/entity"
	"github.com/google/uuid"
)

type ProjectRepository interface {
	Create(ctx context.Context, project *entity.Project) error
	GetByID(ctx context.Context, id uuid.UUID) (*entity.Project, error)
	List(ctx context.Context, userID uuid.UUID) ([]*entity.Project, error)
	Update(ctx context.Context, id uuid.UUID, project *entity.Project) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type ProjectService struct {
	Repo ProjectRepository
}

func NewProjectService(repo ProjectRepository) *ProjectService {
	return &ProjectService{Repo: repo}
}

func (s *ProjectService) Create(ctx context.Context, input dto.CreateProjectInputDTO) (*entity.Project, error) {
	project, err := entity.NewProject(input.UserID, input.Name)
	if err != nil {
		return nil, err
	}
	if err := s.Repo.Create(ctx, project); err != nil {
		return nil, err
	}
	return project, nil
}

func (s *ProjectService) GetByID(ctx context.Context, id string) (*entity.Project, error) {
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return nil, err
	}
	return s.Repo.GetByID(ctx, parsedID)
}

func (s *ProjectService) List(ctx context.Context, userID uuid.UUID) ([]*entity.Project, error) {
	return s.Repo.List(ctx, userID)
}

func (s *ProjectService) Update(ctx context.Context, id string, input dto.UpdateProjectInputDTO) error {
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return err
	}
	project, err := s.Repo.GetByID(ctx, parsedID)
	if err != nil {
		return err
	}
	if err := project.UpdatePartial(input.Name, input.IsActive); err != nil {
		return err
	}
	return s.Repo.Update(ctx, parsedID, project)
}

func (s *ProjectService) Delete(ctx context.Context, id string) error {
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return err
	}
	return s.Repo.Delete(ctx, parsedID)
}
