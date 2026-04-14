package entity

import (
	"errors"

	"github.com/google/uuid"
)

type DietPlan struct {
	ID               uuid.UUID
	ProtocolID       uuid.UUID
	CalorieIntensity DietIntensity
	ProteinIntensity DietIntensity
	FatIntensity     DietIntensity
	Protein          float64
	Carbs            float64
	Fat              float64
	Calories         float64
	Water            float64
	IsActive         bool
}

type DietIntensity string

const (
	DietIntensityMild     DietIntensity = "mild"     // smallest deficit / lowest macros
	DietIntensityModerate DietIntensity = "moderate" // moderate deficit
	DietIntensityStrict   DietIntensity = "strict"   // aggressive deficit
	DietIntensityExtreme  DietIntensity = "extreme"  // maximum deficit
)

var validIntensities = map[DietIntensity]bool{
	DietIntensityMild:     true,
	DietIntensityModerate: true,
	DietIntensityStrict:   true,
	DietIntensityExtreme:  true,
}

func defaultIntensity(i DietIntensity) DietIntensity {
	if i == "" {
		return DietIntensityModerate
	}
	return i
}

// CalorieDeficits maps intensity to kcal subtracted from TDEE.
var CalorieDeficits = map[DietIntensity]float64{
	DietIntensityMild:     250,
	DietIntensityModerate: 500,
	DietIntensityStrict:   750,
	DietIntensityExtreme:  1000,
}

// ProteinPerKg maps intensity to grams of protein per kg of body weight.
var ProteinPerKg = map[DietIntensity]float64{
	DietIntensityMild:     1.6,
	DietIntensityModerate: 1.8,
	DietIntensityStrict:   2.0,
	DietIntensityExtreme:  2.2,
}

// FatPerKg maps intensity to grams of fat per kg of body weight.
var FatPerKg = map[DietIntensity]float64{
	DietIntensityMild:     0.8,
	DietIntensityModerate: 1.0,
	DietIntensityStrict:   1.2,
	DietIntensityExtreme:  1.4,
}

func NewDietPlan(protocolID uuid.UUID, calorieIntensity, proteinIntensity, fatIntensity DietIntensity, protein, carbs, fat, calories, water float64) (*DietPlan, error) {
	calorieIntensity = defaultIntensity(calorieIntensity)
	proteinIntensity = defaultIntensity(proteinIntensity)
	fatIntensity = defaultIntensity(fatIntensity)
	d := &DietPlan{
		ProtocolID:       protocolID,
		CalorieIntensity: calorieIntensity,
		ProteinIntensity: proteinIntensity,
		FatIntensity:     fatIntensity,
		Protein:          round2(protein),
		Carbs:            round2(carbs),
		Fat:              round2(fat),
		Calories:         round2(calories),
		Water:            round2(water),
		IsActive:         true,
	}
	if err := d.Validate(); err != nil {
		return nil, err
	}
	return d, nil
}

func (d *DietPlan) Validate() error {
	if !validIntensities[d.CalorieIntensity] {
		return errors.New("calorie_intensity must be one of: mild, moderate, strict, extreme")
	}
	if !validIntensities[d.ProteinIntensity] {
		return errors.New("protein_intensity must be one of: mild, moderate, strict, extreme")
	}
	if !validIntensities[d.FatIntensity] {
		return errors.New("fat_intensity must be one of: mild, moderate, strict, extreme")
	}
	if d.Protein <= 0 {
		return errors.New("protein must be greater than zero")
	}
	if d.Carbs < 0 {
		return errors.New("carbs cannot be negative")
	}
	if d.Fat <= 0 {
		return errors.New("fat must be greater than zero")
	}
	if d.Calories <= 0 {
		return errors.New("calories must be greater than zero")
	}
	if d.Water <= 0 {
		return errors.New("water must be greater than zero")
	}
	return nil
}

func (d *DietPlan) UpdatePartial(calorieIntensity, proteinIntensity, fatIntensity *DietIntensity, protein, carbs, fat, calories, water *float64, isActive *bool) error {
	if calorieIntensity != nil {
		d.CalorieIntensity = defaultIntensity(*calorieIntensity)
	}
	if proteinIntensity != nil {
		d.ProteinIntensity = defaultIntensity(*proteinIntensity)
	}
	if fatIntensity != nil {
		d.FatIntensity = defaultIntensity(*fatIntensity)
	}
	if protein != nil {
		d.Protein = round2(*protein)
	}
	if carbs != nil {
		d.Carbs = round2(*carbs)
	}
	if fat != nil {
		d.Fat = round2(*fat)
	}
	if calories != nil {
		d.Calories = round2(*calories)
	}
	if water != nil {
		d.Water = round2(*water)
	}
	if isActive != nil {
		d.IsActive = *isActive
	}
	return d.Validate()
}
