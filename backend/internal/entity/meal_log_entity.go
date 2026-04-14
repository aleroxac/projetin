package entity

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

type MealLog struct {
	ID              uuid.UUID
	UserID          uuid.UUID
	MealTitle       string
	MealDescription string
	MealItems       []MealItem
	LoggedAt        time.Time
}

func NewMealLog(userID uuid.UUID, mealTitle, mealDescription string, mealItems []MealItem) (*MealLog, error) {
	e := &MealLog{
		UserID:          userID,
		MealTitle:       mealTitle,
		MealDescription: mealDescription,
		MealItems:       mealItems,
	}
	if err := e.Validate(); err != nil {
		return nil, err
	}
	return e, nil
}

func (m *MealLog) Validate() error {
	if m.UserID == uuid.Nil {
		return errors.New("user ID cannot be empty")
	}
	if m.MealTitle == "" {
		return errors.New("meal title cannot be empty")
	}
	return nil
}

func (m *MealLog) TotalMacros() (protein, carbs, fat, calories float64) {
	for _, item := range m.MealItems {
		protein += item.Protein
		carbs += item.Carbs
		fat += item.Fat
		calories += item.Calories
	}
	return round2(protein), round2(carbs), round2(fat), round2(calories)
}

func (m *MealLog) Update(mealTitle, mealDescription *string, mealItems []MealItem) error {
	if mealTitle != nil {
		m.MealTitle = *mealTitle
	}
	if mealDescription != nil {
		m.MealDescription = *mealDescription
	}
	m.MealItems = mealItems
	return m.Validate()
}
