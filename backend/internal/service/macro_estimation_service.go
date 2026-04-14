package service

import (
	"context"

	"github.com/aleroxac/projetin/internal/dto"
	"github.com/aleroxac/projetin/internal/entity"
	ai "github.com/aleroxac/projetin/internal/infra/ai"
	"github.com/google/uuid"
)

type MacroEstimationRepository interface {
	Create(ctx context.Context, e *entity.MacroEstimation) error
	GetByID(ctx context.Context, id uuid.UUID) (*entity.MacroEstimation, error)
	List(ctx context.Context, userID uuid.UUID) ([]*entity.MacroEstimation, error)
	Delete(ctx context.Context, id uuid.UUID) error
}

type macroEstimationUserReader interface {
	GetByID(ctx context.Context, id uuid.UUID) (*entity.User, error)
}

type MacroEstimationService struct {
	Repo       MacroEstimationRepository
	UserRepo   macroEstimationUserReader
	AIProvider ai.AIProvider
}

func NewMacroEstimationService(
	repo MacroEstimationRepository,
	userRepo macroEstimationUserReader,
	aiProvider ai.AIProvider,
) *MacroEstimationService {
	return &MacroEstimationService{
		Repo:       repo,
		UserRepo:   userRepo,
		AIProvider: aiProvider,
	}
}

func (s *MacroEstimationService) Estimate(ctx context.Context, input dto.CreateMacroEstimationInputDTO) (*dto.MacroEstimationOutputDTO, error) {
	userID, err := uuid.Parse(input.UserID)
	if err != nil {
		return nil, err
	}
	if _, err := s.UserRepo.GetByID(ctx, userID); err != nil {
		return nil, err
	}

	aiItems, err := s.AIProvider.EstimateMacros(ctx, input.MealDescription)
	if err != nil {
		return nil, err
	}

	mealItems := make([]entity.MealItem, len(aiItems))
	for i, item := range aiItems {
		mealItems[i] = entity.MealItem{
			Item:     item.Item,
			Quantity: item.Quantity,
			Unit:     item.Unit,
			Protein:  item.Protein,
			Carbs:    item.Carbs,
			Fat:      item.Fat,
			Calories: item.Calories,
		}
	}

	estimation, err := entity.NewMacroEstimation(userID, input.MealDescription, mealItems)
	if err != nil {
		return nil, err
	}

	if err := s.Repo.Create(ctx, estimation); err != nil {
		return nil, err
	}

	protein, carbs, fat, calories := estimation.TotalMacros()
	return toMacroEstimationOutputDTO(estimation, protein, carbs, fat, calories), nil
}

func (s *MacroEstimationService) GetByID(ctx context.Context, id string) (*dto.MacroEstimationOutputDTO, error) {
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return nil, err
	}
	estimation, err := s.Repo.GetByID(ctx, parsedID)
	if err != nil {
		return nil, err
	}
	protein, carbs, fat, calories := estimation.TotalMacros()
	return toMacroEstimationOutputDTO(estimation, protein, carbs, fat, calories), nil
}

func (s *MacroEstimationService) List(ctx context.Context, userID string) ([]*dto.MacroEstimationOutputDTO, error) {
	parsedID, err := uuid.Parse(userID)
	if err != nil {
		return nil, err
	}
	estimations, err := s.Repo.List(ctx, parsedID)
	if err != nil {
		return nil, err
	}
	output := make([]*dto.MacroEstimationOutputDTO, len(estimations))
	for i, e := range estimations {
		protein, carbs, fat, calories := e.TotalMacros()
		output[i] = toMacroEstimationOutputDTO(e, protein, carbs, fat, calories)
	}
	return output, nil
}

func (s *MacroEstimationService) Delete(ctx context.Context, id string) error {
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return err
	}
	return s.Repo.Delete(ctx, parsedID)
}

func toMacroEstimationOutputDTO(e *entity.MacroEstimation, protein, carbs, fat, calories float64) *dto.MacroEstimationOutputDTO {
	items := make([]dto.MealItem, len(e.MealItems))
	for i, item := range e.MealItems {
		items[i] = dto.MealItem{
			Item:     item.Item,
			Quantity: item.Quantity,
			Unit:     item.Unit,
			Protein:  item.Protein,
			Carbs:    item.Carbs,
			Fat:      item.Fat,
			Calories: item.Calories,
		}
	}
	return &dto.MacroEstimationOutputDTO{
		ID:              e.ID.String(),
		UserID:          e.UserID.String(),
		MealDescription: e.MealDescription,
		MealItems:       items,
		Protein:         protein,
		Carbs:           carbs,
		Fat:             fat,
		Calories:        calories,
	}
}
