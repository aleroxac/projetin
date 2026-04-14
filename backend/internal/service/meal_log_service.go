package service

import (
	"context"
	"math"
	"sort"
	"time"

	"github.com/aleroxac/projetin/internal/dto"
	"github.com/aleroxac/projetin/internal/entity"
	ai "github.com/aleroxac/projetin/internal/infra/ai"
	"github.com/google/uuid"
)

type MealLogRepository interface {
	Create(ctx context.Context, e *entity.MealLog) error
	GetByID(ctx context.Context, id uuid.UUID) (*entity.MealLog, error)
	List(ctx context.Context, userID uuid.UUID) ([]*entity.MealLog, error)
	Update(ctx context.Context, e *entity.MealLog) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type mealLogUserReader interface {
	GetByID(ctx context.Context, id uuid.UUID) (*entity.User, error)
}

type MealLogService struct {
	Repo       MealLogRepository
	UserRepo   mealLogUserReader
	AIProvider ai.AIProvider
}

func NewMealLogService(repo MealLogRepository, userRepo mealLogUserReader, aiProvider ai.AIProvider) *MealLogService {
	return &MealLogService{Repo: repo, UserRepo: userRepo, AIProvider: aiProvider}
}

func (s *MealLogService) Create(ctx context.Context, input dto.CreateMealLogInputDTO) (*dto.MealLogOutputDTO, error) {
	userID, err := uuid.Parse(input.UserID)
	if err != nil {
		return nil, err
	}
	if _, err := s.UserRepo.GetByID(ctx, userID); err != nil {
		return nil, err
	}

	mealItems, err := s.estimateItems(ctx, input.MealDescription)
	if err != nil {
		return nil, err
	}

	mealLog, err := entity.NewMealLog(userID, input.MealTitle, input.MealDescription, mealItems)
	if err != nil {
		return nil, err
	}

	if err := s.Repo.Create(ctx, mealLog); err != nil {
		return nil, err
	}

	protein, carbs, fat, calories := mealLog.TotalMacros()
	return toMealLogOutputDTO(mealLog, protein, carbs, fat, calories), nil
}

func (s *MealLogService) GetByID(ctx context.Context, id string) (*dto.MealLogOutputDTO, error) {
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return nil, err
	}
	mealLog, err := s.Repo.GetByID(ctx, parsedID)
	if err != nil {
		return nil, err
	}
	protein, carbs, fat, calories := mealLog.TotalMacros()
	return toMealLogOutputDTO(mealLog, protein, carbs, fat, calories), nil
}

func (s *MealLogService) List(ctx context.Context, userID string) ([]*dto.MealLogOutputDTO, error) {
	parsedID, err := uuid.Parse(userID)
	if err != nil {
		return nil, err
	}
	mealLogs, err := s.Repo.List(ctx, parsedID)
	if err != nil {
		return nil, err
	}
	output := make([]*dto.MealLogOutputDTO, len(mealLogs))
	for i, ml := range mealLogs {
		protein, carbs, fat, calories := ml.TotalMacros()
		output[i] = toMealLogOutputDTO(ml, protein, carbs, fat, calories)
	}
	return output, nil
}

func (s *MealLogService) Update(ctx context.Context, id string, input dto.UpdateMealLogInputDTO) (*dto.MealLogOutputDTO, error) {
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return nil, err
	}
	mealLog, err := s.Repo.GetByID(ctx, parsedID)
	if err != nil {
		return nil, err
	}

	// Re-estimate macros whenever the description changes.
	description := input.MealDescription
	if description == nil {
		existing := mealLog.MealDescription
		description = &existing
	}
	mealItems, err := s.estimateItems(ctx, *description)
	if err != nil {
		return nil, err
	}

	if err := mealLog.Update(input.MealTitle, input.MealDescription, mealItems); err != nil {
		return nil, err
	}

	if err := s.Repo.Update(ctx, mealLog); err != nil {
		return nil, err
	}

	protein, carbs, fat, calories := mealLog.TotalMacros()
	return toMealLogOutputDTO(mealLog, protein, carbs, fat, calories), nil
}

func (s *MealLogService) History(ctx context.Context, userID string) ([]*dto.MealLogHistoryDayDTO, error) {
	parsedID, err := uuid.Parse(userID)
	if err != nil {
		return nil, err
	}
	mealLogs, err := s.Repo.List(ctx, parsedID)
	if err != nil {
		return nil, err
	}

	// Group meals by calendar date (user's local date from LoggedAt).
	type dayKey = string // "YYYY-MM-DD"
	dayIndex := map[dayKey]int{}
	var days []*dto.MealLogHistoryDayDTO

	for _, ml := range mealLogs {
		date := ml.LoggedAt.Format(time.DateOnly)
		protein, carbs, fat, calories := ml.TotalMacros()

		entry := dto.MealLogHistoryEntryDTO{
			ID:              ml.ID.String(),
			LoggedAt:        ml.LoggedAt.Format(time.RFC3339),
			MealTitle:       ml.MealTitle,
			MealDescription: ml.MealDescription,
			Protein:         protein,
			Carbs:           carbs,
			Fat:             fat,
			Calories:        calories,
		}

		if idx, ok := dayIndex[date]; ok {
			d := days[idx]
			d.Meals = append(d.Meals, entry)
			d.TotalProtein = round2(d.TotalProtein + protein)
			d.TotalCarbs = round2(d.TotalCarbs + carbs)
			d.TotalFat = round2(d.TotalFat + fat)
			d.TotalCalories = round2(d.TotalCalories + calories)
		} else {
			dayIndex[date] = len(days)
			days = append(days, &dto.MealLogHistoryDayDTO{
				Date:          date,
				Meals:         []dto.MealLogHistoryEntryDTO{entry},
				TotalProtein:  protein,
				TotalCarbs:    carbs,
				TotalFat:      fat,
				TotalCalories: calories,
			})
		}
	}

	// Sort days descending (most recent first).
	sort.Slice(days, func(i, j int) bool {
		return days[i].Date > days[j].Date
	})

	return days, nil
}

func round2(v float64) float64 {
	return math.Round(v*100) / 100
}

func (s *MealLogService) Delete(ctx context.Context, id string) error {
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return err
	}
	return s.Repo.Delete(ctx, parsedID)
}

func (s *MealLogService) estimateItems(ctx context.Context, description string) ([]entity.MealItem, error) {
	aiItems, err := s.AIProvider.EstimateMacros(ctx, description)
	if err != nil {
		return nil, err
	}
	items := make([]entity.MealItem, len(aiItems))
	for i, item := range aiItems {
		items[i] = entity.MealItem{
			Item:     item.Item,
			Quantity: item.Quantity,
			Unit:     item.Unit,
			Protein:  item.Protein,
			Carbs:    item.Carbs,
			Fat:      item.Fat,
			Calories: item.Calories,
		}
	}
	return items, nil
}

func toMealLogOutputDTO(ml *entity.MealLog, protein, carbs, fat, calories float64) *dto.MealLogOutputDTO {
	items := make([]dto.MealItem, len(ml.MealItems))
	for i, item := range ml.MealItems {
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
	return &dto.MealLogOutputDTO{
		ID:              ml.ID.String(),
		UserID:          ml.UserID.String(),
		MealTitle:       ml.MealTitle,
		MealDescription: ml.MealDescription,
		MealItems:       items,
		Protein:         protein,
		Carbs:           carbs,
		Fat:             fat,
		Calories:        calories,
	}
}
