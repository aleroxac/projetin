package entity

import (
	"errors"

	"github.com/google/uuid"
)

func (m *MacroEstimation) TotalMacros() (protein, carbs, fat, calories float64) {
	for _, item := range m.MealItems {
		protein += item.Protein
		carbs += item.Carbs
		fat += item.Fat
		calories += item.Calories
	}
	return round2(protein), round2(carbs), round2(fat), round2(calories)
}

type MacroEstimation struct {
	ID              uuid.UUID
	UserID          uuid.UUID
	MealDescription string
	MealItems       []MealItem
}

type MealItem struct {
	Item     string
	Quantity float64
	Unit     string
	Calories float64
	Protein  float64
	Carbs    float64
	Fat      float64
}

func NewMacroEstimation(userID uuid.UUID, mealDescription string, mealItems []MealItem) (*MacroEstimation, error) {
	e := &MacroEstimation{
		UserID:          userID,
		MealDescription: mealDescription,
		MealItems:       mealItems,
	}
	if err := e.Validate(); err != nil {
		return nil, err
	}
	return e, nil
}

func (m *MacroEstimation) Validate() error {
	if m.UserID == uuid.Nil {
		return errors.New("user ID cannot be empty")
	}
	if m.MealDescription == "" {
		return errors.New("meal description cannot be empty")
	}
	if len(m.MealItems) == 0 {
		return errors.New("meal items cannot be empty")
	}
	return nil
}

func (m *MacroEstimation) UpdatePartial(mealDescription *string, mealItems *[]MealItem) error {
	if mealDescription != nil {
		m.MealDescription = *mealDescription
	}
	if mealItems != nil {
		m.MealItems = *mealItems
	}
	return m.Validate()
}
