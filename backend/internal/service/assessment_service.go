package service

import (
	"context"
	"time"

	dto "github.com/aleroxac/projetin/internal/dto"
	"github.com/aleroxac/projetin/internal/entity"
	"github.com/google/uuid"
)

type AssessmentRepository interface {
	Create(ctx context.Context, assessment *entity.Assessment) error
	GetByID(ctx context.Context, id uuid.UUID) (*entity.Assessment, error)
	List(ctx context.Context, userID uuid.UUID) ([]*entity.Assessment, error)
	Update(ctx context.Context, id uuid.UUID, assessment *entity.Assessment) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type AssessmentService struct {
	Repo     AssessmentRepository
	UserRepo UserRepository
}

func NewAssessmentService(repo AssessmentRepository, userRepo UserRepository) *AssessmentService {
	return &AssessmentService{Repo: repo, UserRepo: userRepo}
}

func (uc *AssessmentService) Create(ctx context.Context, userId uuid.UUID, input dto.CreateAssessmentInputDTO) (*dto.CreateAssessmentOutputDTO, error) {
	user, err := uc.UserRepo.GetByID(ctx, userId)
	if err != nil {
		return nil, err
	}

	assessment, err := entity.NewAssessment(userId, input.Weight, input.Height, input.BodyFat, input.ActivityLevel)
	if err != nil {
		return nil, err
	}

	bmi := assessment.CalculateBMI()
	bmr := assessment.CalculateBMR(user.CalculateAge(), user.BiologicalSex)
	tdee := assessment.CalculateTDEE(bmr)
	assessment.BMI, assessment.BMR, assessment.TDEE = bmi, bmr, tdee

	if err := uc.Repo.Create(ctx, assessment); err != nil {
		return nil, err
	}

	return &dto.CreateAssessmentOutputDTO{
		BMI:  &bmi,
		BMR:  &bmr,
		TDEE: &tdee,
	}, nil
}

func (uc *AssessmentService) GetByID(ctx context.Context, id string) (*entity.Assessment, error) {
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return nil, err
	}
	return uc.Repo.GetByID(ctx, parsedID)
}

func (uc *AssessmentService) List(ctx context.Context, userID uuid.UUID) ([]*entity.Assessment, error) {
	return uc.Repo.List(ctx, userID)
}

func (uc *AssessmentService) Update(ctx context.Context, id string, input dto.UpdateAssessmentInputDTO) error {
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return err
	}
	assessment, err := uc.Repo.GetByID(ctx, parsedID)
	if err != nil {
		return err
	}

	err = assessment.UpdatePartial(input.Weight, input.Height, input.BodyFat, input.ActivityLevel)
	if err != nil {
		return err
	}

	user, err := uc.UserRepo.GetByID(ctx, assessment.UserID)
	if err != nil {
		return err
	}

	bmr := assessment.CalculateBMR(user.CalculateAge(), user.BiologicalSex)
	assessment.BMI = assessment.CalculateBMI()
	assessment.BMR = bmr
	assessment.TDEE = assessment.CalculateTDEE(bmr)

	return uc.Repo.Update(ctx, parsedID, assessment)
}

func (uc *AssessmentService) History(ctx context.Context, userID uuid.UUID) ([]*dto.AssessmentHistoryEntryDTO, error) {
	assessments, err := uc.Repo.List(ctx, userID)
	if err != nil {
		return nil, err
	}
	output := make([]*dto.AssessmentHistoryEntryDTO, len(assessments))
	for i, a := range assessments {
		output[i] = &dto.AssessmentHistoryEntryDTO{
			ID:         a.ID.String(),
			RecordedAt: a.RecordedAt.Format(time.RFC3339),
			Weight:     a.Weight,
			BodyFat:    a.BodyFat,
			BMI:        a.BMI,
			BMR:        a.BMR,
			TDEE:       a.TDEE,
		}
	}
	return output, nil
}

func (uc *AssessmentService) Delete(ctx context.Context, id string) error {
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return err
	}

	err = uc.Repo.Delete(ctx, parsedID)
	if err != nil {
		return err
	}

	return err
}
