package service

import (
	"context"
	"math"
	"time"

	"github.com/aleroxac/projetin/internal/dto"
	"github.com/aleroxac/projetin/internal/entity"
	"github.com/google/uuid"
)

type DietPlanRepository interface {
	Create(ctx context.Context, dietPlan *entity.DietPlan) error
	GetByID(ctx context.Context, id uuid.UUID) (*entity.DietPlan, error)
	List(ctx context.Context, protocolID uuid.UUID) ([]*entity.DietPlan, error)
	Update(ctx context.Context, id uuid.UUID, dietPlan *entity.DietPlan) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type dietPlanProtocolReader interface {
	GetByID(ctx context.Context, id uuid.UUID) (*entity.Protocol, error)
}

type dietPlanGoalReader interface {
	GetByID(ctx context.Context, id uuid.UUID) (*entity.Goal, error)
}

type dietPlanProjectReader interface {
	GetByID(ctx context.Context, id uuid.UUID) (*entity.Project, error)
}

type dietPlanAssessmentReader interface {
	GetLatestByUserID(ctx context.Context, userID uuid.UUID) (*entity.Assessment, error)
}

type dietPlanMealLogReader interface {
	List(ctx context.Context, userID uuid.UUID) ([]*entity.MealLog, error)
}

type DietPlanService struct {
	Repo           DietPlanRepository
	ProtocolRepo   dietPlanProtocolReader
	GoalRepo       dietPlanGoalReader
	ProjectRepo    dietPlanProjectReader
	AssessmentRepo dietPlanAssessmentReader
	MealLogRepo    dietPlanMealLogReader
}

func NewDietPlanService(
	repo DietPlanRepository,
	protocolRepo dietPlanProtocolReader,
	goalRepo dietPlanGoalReader,
	projectRepo dietPlanProjectReader,
	assessmentRepo dietPlanAssessmentReader,
	mealLogRepo dietPlanMealLogReader,
) *DietPlanService {
	return &DietPlanService{
		Repo:           repo,
		ProtocolRepo:   protocolRepo,
		GoalRepo:       goalRepo,
		ProjectRepo:    projectRepo,
		AssessmentRepo: assessmentRepo,
		MealLogRepo:    mealLogRepo,
	}
}

func (s *DietPlanService) Create(ctx context.Context, input dto.CreateDietPlanInputDTO) error {
	protocol, err := s.ProtocolRepo.GetByID(ctx, input.ProtocolID)
	if err != nil {
		return err
	}
	goal, err := s.GoalRepo.GetByID(ctx, protocol.GoalID)
	if err != nil {
		return err
	}
	project, err := s.ProjectRepo.GetByID(ctx, goal.ProjectID)
	if err != nil {
		return err
	}
	assessment, err := s.AssessmentRepo.GetLatestByUserID(ctx, project.UserID)
	if err != nil {
		return err
	}

	calorieIntensity := entity.DietIntensity(input.CalorieIntensity)
	proteinIntensity := entity.DietIntensity(input.ProteinIntensity)
	fatIntensity := entity.DietIntensity(input.FatIntensity)

	targets := assessment.CalculateDietTargets(calorieIntensity, proteinIntensity, fatIntensity)

	dietPlan, err := entity.NewDietPlan(
		input.ProtocolID,
		calorieIntensity,
		proteinIntensity,
		fatIntensity,
		targets.Protein,
		targets.Carbs,
		targets.Fat,
		targets.Calories,
		targets.Water,
	)
	if err != nil {
		return err
	}
	return s.Repo.Create(ctx, dietPlan)
}

func (s *DietPlanService) GetByID(ctx context.Context, id string) (*entity.DietPlan, error) {
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return nil, err
	}
	return s.Repo.GetByID(ctx, parsedID)
}

func (s *DietPlanService) List(ctx context.Context, protocolID uuid.UUID) ([]*entity.DietPlan, error) {
	return s.Repo.List(ctx, protocolID)
}

func (s *DietPlanService) Update(ctx context.Context, id string, input dto.UpdateDietPlanInputDTO) error {
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return err
	}
	dietPlan, err := s.Repo.GetByID(ctx, parsedID)
	if err != nil {
		return err
	}
	toIntensityPtr := func(s *string) *entity.DietIntensity {
		if s == nil {
			return nil
		}
		v := entity.DietIntensity(*s)
		return &v
	}
	if err := dietPlan.UpdatePartial(
		toIntensityPtr(input.CalorieIntensity),
		toIntensityPtr(input.ProteinIntensity),
		toIntensityPtr(input.FatIntensity),
		input.Protein,
		input.Carbs,
		input.Fat,
		input.Calories,
		input.Water,
		input.IsActive,
	); err != nil {
		return err
	}
	return s.Repo.Update(ctx, parsedID, dietPlan)
}

func (s *DietPlanService) Delete(ctx context.Context, id string) error {
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return err
	}
	return s.Repo.Delete(ctx, parsedID)
}

func (s *DietPlanService) Adherence(ctx context.Context, dietPlanID, userID string) (*dto.DietPlanAdherenceOutputDTO, error) {
	parsedDietPlanID, err := uuid.Parse(dietPlanID)
	if err != nil {
		return nil, err
	}
	parsedUserID, err := uuid.Parse(userID)
	if err != nil {
		return nil, err
	}

	dietPlan, err := s.Repo.GetByID(ctx, parsedDietPlanID)
	if err != nil {
		return nil, err
	}

	logs, err := s.MealLogRepo.List(ctx, parsedUserID)
	if err != nil {
		return nil, err
	}

	today := time.Now().UTC().Format(time.DateOnly)
	var totalProtein, totalCarbs, totalFat, totalCalories float64
	for _, ml := range logs {
		if ml.LoggedAt.UTC().Format(time.DateOnly) != today {
			continue
		}
		p, c, f, cal := ml.TotalMacros()
		totalProtein += p
		totalCarbs += c
		totalFat += f
		totalCalories += cal
	}

	adh := func(consumed, target float64) float64 {
		if target <= 0 {
			return 1.0
		}
		return math.Round(consumed/target*1000) / 1000
	}

	proteinAdh := adh(totalProtein, dietPlan.Protein)
	carbsAdh := adh(totalCarbs, dietPlan.Carbs)
	fatAdh := adh(totalFat, dietPlan.Fat)
	caloriesAdh := adh(totalCalories, dietPlan.Calories)
	global := math.Round((proteinAdh+carbsAdh+fatAdh+caloriesAdh)/4*1000) / 1000

	return &dto.DietPlanAdherenceOutputDTO{
		Date:       today,
		DietPlanID: dietPlanID,
		Protein: dto.MacroAdherenceDTO{
			Target:    dietPlan.Protein,
			Consumed:  math.Round(totalProtein*100) / 100,
			Adherence: proteinAdh,
		},
		Carbs: dto.MacroAdherenceDTO{
			Target:    dietPlan.Carbs,
			Consumed:  math.Round(totalCarbs*100) / 100,
			Adherence: carbsAdh,
		},
		Fat: dto.MacroAdherenceDTO{
			Target:    dietPlan.Fat,
			Consumed:  math.Round(totalFat*100) / 100,
			Adherence: fatAdh,
		},
		Calories: dto.MacroAdherenceDTO{
			Target:    dietPlan.Calories,
			Consumed:  math.Round(totalCalories*100) / 100,
			Adherence: caloriesAdh,
		},
		GlobalAdherence: global,
	}, nil
}
