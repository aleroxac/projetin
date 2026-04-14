package service

import (
	"context"

	"github.com/aleroxac/projetin/internal/dto"
	"github.com/aleroxac/projetin/internal/entity"
	"github.com/google/uuid"
)

type ProtocolRepository interface {
	Create(ctx context.Context, protocol *entity.Protocol) error
	GetByID(ctx context.Context, id uuid.UUID) (*entity.Protocol, error)
	List(ctx context.Context, goalID uuid.UUID) ([]*entity.Protocol, error)
	Update(ctx context.Context, id uuid.UUID, protocol *entity.Protocol) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type ProtocolService struct {
	Repo ProtocolRepository
}

func NewProtocolService(repo ProtocolRepository) *ProtocolService {
	return &ProtocolService{Repo: repo}
}

func (s *ProtocolService) Create(ctx context.Context, input dto.CreateProtocolInputDTO) error {
	protocol, err := entity.NewProtocol(input.GoalID, input.Name)
	if err != nil {
		return err
	}
	return s.Repo.Create(ctx, protocol)
}

func (s *ProtocolService) GetByID(ctx context.Context, id string) (*entity.Protocol, error) {
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return nil, err
	}
	return s.Repo.GetByID(ctx, parsedID)
}

func (s *ProtocolService) List(ctx context.Context, goalID uuid.UUID) ([]*entity.Protocol, error) {
	return s.Repo.List(ctx, goalID)
}

func (s *ProtocolService) Update(ctx context.Context, id string, input dto.UpdateProtocolInputDTO) error {
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return err
	}
	protocol, err := s.Repo.GetByID(ctx, parsedID)
	if err != nil {
		return err
	}
	if err := protocol.UpdatePartial(input.Name, input.IsActive); err != nil {
		return err
	}
	return s.Repo.Update(ctx, parsedID, protocol)
}

func (s *ProtocolService) Delete(ctx context.Context, id string) error {
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return err
	}
	return s.Repo.Delete(ctx, parsedID)
}
