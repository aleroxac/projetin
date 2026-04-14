package dto

import "github.com/google/uuid"

type MacroAdherenceDTO struct {
	Target    float64 `json:"target"`
	Consumed  float64 `json:"consumed"`
	Adherence float64 `json:"adherence"` // ratio consumed/target; > 1.0 means over-target
}

type DietPlanAdherenceOutputDTO struct {
	Date            string            `json:"date"`
	DietPlanID      string            `json:"diet_plan_id"`
	Protein         MacroAdherenceDTO `json:"protein"`
	Carbs           MacroAdherenceDTO `json:"carbs"`
	Fat             MacroAdherenceDTO `json:"fat"`
	Calories        MacroAdherenceDTO `json:"calories"`
	GlobalAdherence float64           `json:"global_adherence"` // average of individual ratios; > 1.0 means over-target overall
}

type DietPlanOutputDTO struct {
	ID               string  `json:"id"`
	ProtocolID       string  `json:"protocol_id"`
	CalorieIntensity string  `json:"calorie_intensity"`
	ProteinIntensity string  `json:"protein_intensity"`
	FatIntensity     string  `json:"fat_intensity"`
	Protein          float64 `json:"protein"`
	Carbs            float64 `json:"carbs"`
	Fat              float64 `json:"fat"`
	Calories         float64 `json:"calories"`
	Water            float64 `json:"water"`
	IsActive         bool    `json:"is_active"`
}

type CreateDietPlanInputDTO struct {
	ProtocolID       uuid.UUID `json:"protocol_id"`
	CalorieIntensity string    `json:"calorie_intensity"`
	ProteinIntensity string    `json:"protein_intensity"`
	FatIntensity     string    `json:"fat_intensity"`
}

type UpdateDietPlanInputDTO struct {
	CalorieIntensity *string  `json:"calorie_intensity"`
	ProteinIntensity *string  `json:"protein_intensity"`
	FatIntensity     *string  `json:"fat_intensity"`
	Protein          *float64 `json:"protein"`
	Carbs            *float64 `json:"carbs"`
	Fat              *float64 `json:"fat"`
	Calories         *float64 `json:"calories"`
	Water            *float64 `json:"water"`
	IsActive         *bool    `json:"is_active"`
}
