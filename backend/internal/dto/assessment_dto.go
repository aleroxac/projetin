package dto

import "github.com/google/uuid"

type AssessmentOutputDTO struct {
	ID            string  `json:"id"`
	UserID        string  `json:"user_id"`
	Weight        float64 `json:"weight"`
	Height        float64 `json:"height"`
	BodyFat       float64 `json:"body_fat"`
	ActivityLevel string  `json:"activity_level"`
	BMI           float64 `json:"bmi"`
	BMR           float64 `json:"bmr"`
	TDEE          float64 `json:"tdee"`
}

type CreateAssessmentInputDTO struct {
	UserID        uuid.UUID `json:"user_id"`
	Weight        float64   `json:"weight"`
	Height        float64   `json:"height"`
	BodyFat       float64   `json:"body_fat"`
	ActivityLevel string    `json:"activity_level"`
}

type CreateAssessmentOutputDTO struct {
	BMI  *float64 `json:"bmi"`
	BMR  *float64 `json:"bmr"`
	TDEE *float64 `json:"tdee"`
}

type UpdateAssessmentInputDTO struct {
	Weight        *float64 `json:"weight"`
	Height        *float64 `json:"height"`
	BodyFat       *float64 `json:"body_fat"`
	ActivityLevel *string  `json:"activity_level"`
}

type AssessmentHistoryEntryDTO struct {
	ID         string  `json:"id"`
	RecordedAt string  `json:"recorded_at"`
	Weight     float64 `json:"weight"`
	BodyFat    float64 `json:"body_fat"`
	BMI        float64 `json:"bmi"`
	BMR        float64 `json:"bmr"`
	TDEE       float64 `json:"tdee"`
}
