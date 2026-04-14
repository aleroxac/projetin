package dto

type CreateMealLogInputDTO struct {
	UserID          string `json:"user_id"`
	MealTitle       string `json:"meal_title"`
	MealDescription string `json:"meal_description"`
}

type UpdateMealLogInputDTO struct {
	MealTitle       *string `json:"meal_title"`
	MealDescription *string `json:"meal_description"`
}

type MealLogOutputDTO struct {
	ID              string     `json:"id"`
	UserID          string     `json:"user_id"`
	MealTitle       string     `json:"meal_title"`
	MealDescription string     `json:"meal_description"`
	MealItems       []MealItem `json:"meal_items"`
	Protein         float64    `json:"protein"`
	Carbs           float64    `json:"carbs"`
	Fat             float64    `json:"fat"`
	Calories        float64    `json:"calories"`
}

type MealLogHistoryEntryDTO struct {
	ID              string  `json:"id"`
	LoggedAt        string  `json:"logged_at"`
	MealTitle       string  `json:"meal_title"`
	MealDescription string  `json:"meal_description"`
	Protein         float64 `json:"protein"`
	Carbs           float64 `json:"carbs"`
	Fat             float64 `json:"fat"`
	Calories        float64 `json:"calories"`
}

type MealLogHistoryDayDTO struct {
	Date          string                   `json:"date"`
	Meals         []MealLogHistoryEntryDTO `json:"meals"`
	TotalProtein  float64                  `json:"total_protein"`
	TotalCarbs    float64                  `json:"total_carbs"`
	TotalFat      float64                  `json:"total_fat"`
	TotalCalories float64                  `json:"total_calories"`
}
