package entity

import (
	"errors"
	"math"
	"time"

	"github.com/google/uuid"
)

func round2(v float64) float64 {
	return math.Round(v*100) / 100
}

type Assessment struct {
	ID            uuid.UUID
	UserID        uuid.UUID
	Weight        float64
	Height        float64
	BodyFat       float64
	ActivityLevel string
	BMI           float64
	BMR           float64
	TDEE          float64
	RecordedAt    time.Time
}

var BMR_METHODS = []string{"harris-benedict", "mifflin-st-jeor"}
var DEFAULT_BMR_METHOD = "mifflin-st-jeor"

func NewAssessment(user_id uuid.UUID, weight, height, bodyFat float64, activity_level string) (*Assessment, error) {
	u := &Assessment{
		UserID:        user_id,
		Weight:        round2(weight),
		Height:        round2(height),
		BodyFat:       round2(bodyFat),
		ActivityLevel: activity_level,
		BMI:           0,
		BMR:           0,
		TDEE:          0,
	}

	if err := u.Validate(); err != nil {
		return nil, err
	}

	return u, nil
}

func (u *Assessment) Validate() error {
	if u.Weight <= 0 {
		return errors.New("weight must be greater than zero")
	}
	if u.Height <= 0 {
		return errors.New("height must be greater than zero")
	}
	if u.BodyFat < 0 || u.BodyFat > 100 {
		return errors.New("body fat percentage must be between 0 and 100")
	}

	if u.ActivityLevel != "sedentary" &&
		u.ActivityLevel != "lightly_active" &&
		u.ActivityLevel != "moderately_active" &&
		u.ActivityLevel != "very_active" &&
		u.ActivityLevel != "extremely_active" {
		return errors.New("activity level must be one of: sedentary, lightly_active, moderately_active, very_active, extremely_active")
	}
	return nil
}

func (u *Assessment) Update(weight, height, bodyFat float64, activity_level string) error {
	u.Weight = round2(weight)
	u.Height = round2(height)
	u.BodyFat = round2(bodyFat)
	u.ActivityLevel = activity_level
	return u.Validate()
}

func (u *Assessment) UpdatePartial(weight, height, bodyFat *float64, activityLevel *string) error {
	if weight != nil {
		u.Weight = round2(*weight)
	}
	if height != nil {
		u.Height = round2(*height)
	}
	if bodyFat != nil {
		u.BodyFat = round2(*bodyFat)
	}
	if activityLevel != nil {
		u.ActivityLevel = *activityLevel
	}

	return u.Validate()
}

type DietTargets struct {
	Protein  float64
	Carbs    float64
	Fat      float64
	Calories float64
	Water    float64
}

// CalculateDietTargets derives macro targets from the assessment using intensity levels.
// Calories: TDEE minus a fixed deficit (250/500/750/1000 kcal by intensity)
// Protein:  weight × g/kg factor (1.6/1.8/2.0/2.2 by intensity)
// Fat:      weight × g/kg factor (0.8/1.0/1.2/1.4 by intensity)
// Carbs:    remaining calories after protein (4 kcal/g) and fat (9 kcal/g), divided by 4
// Water:    weight × 35 ml/kg
func (a *Assessment) CalculateDietTargets(calorieIntensity, proteinIntensity, fatIntensity DietIntensity) DietTargets {
	calories := round2(a.TDEE - CalorieDeficits[calorieIntensity])
	protein := round2(a.Weight * ProteinPerKg[proteinIntensity])
	fat := round2(a.Weight * FatPerKg[fatIntensity])
	carbCalories := calories - (protein*4 + fat*9)
	carbs := round2(carbCalories / 4)
	if carbs < 0 {
		carbs = 0
	}
	water := round2(a.Weight * 35)
	return DietTargets{
		Protein:  protein,
		Carbs:    carbs,
		Fat:      fat,
		Calories: calories,
		Water:    water,
	}
}

// CalculateBMI expects weight in kg and height in cm.
func (a *Assessment) CalculateBMI() float64 {
	heightM := a.Height / 100
	return round2(a.Weight / (heightM * heightM))
}

func (a *Assessment) CalculateTDEE(bmr float64) float64 {
	multipliers := map[string]float64{
		"sedentary":         1.2,
		"lightly_active":    1.375,
		"moderately_active": 1.55,
		"very_active":       1.725,
		"extremely_active":  1.9,
	}
	return round2(bmr * multipliers[a.ActivityLevel])
}

func (a *Assessment) CalculateBMR(age int, sex string) float64 {
	switch DEFAULT_BMR_METHOD {
	case "harris-benedict":
		return a.calculateHarrisBenedict(age, sex)
	case "mifflin-st-jeor":
		return a.calculateMifflinStJeor(age, sex)
	}

	return 0
}

// calculateHarrisBenedict expects weight in kg and height in cm.
func (a *Assessment) calculateHarrisBenedict(age int, sex string) float64 {
	// male:   88.362 + (13.397 * weight_kg) + (4.799 * height_cm) - (5.677 * age)
	// female: 447.593 + (9.247 * weight_kg) + (3.098 * height_cm) - (4.330 * age)
	if sex == "male" {
		return round2(88.362 + (13.397 * a.Weight) + (4.799 * a.Height) - (5.677 * float64(age)))
	}
	return round2(447.593 + (9.247 * a.Weight) + (3.098 * a.Height) - (4.330 * float64(age)))
}

// calculateMifflinStJeor expects weight in kg and height in cm.
func (a *Assessment) calculateMifflinStJeor(age int, sex string) float64 {
	// male:   10*weight_kg + 6.25*height_cm - 5*age + 5
	// female: 10*weight_kg + 6.25*height_cm - 5*age - 161
	base := 10*a.Weight + 6.25*a.Height - 5*float64(age)
	if sex == "male" {
		return round2(base + 5)
	}
	return round2(base - 161)
}
