package dto

type MacroEstimationOutputDTO struct {
	ID              string     `json:"id"`
	UserID          string     `json:"user_id"`
	MealDescription string     `json:"meal_description"`
	MealItems       []MealItem `json:"meal_items"`
	Protein         float64    `json:"protein"`
	Carbs           float64    `json:"carbs"`
	Fat             float64    `json:"fat"`
	Calories        float64    `json:"calories"`
}

type MealItem struct {
	Item     string  `json:"item"`
	Quantity float64 `json:"quantity"`
	Unit     string  `json:"unit"`
	Protein  float64 `json:"protein"`
	Carbs    float64 `json:"carbs"`
	Fat      float64 `json:"fat"`
	Calories float64 `json:"calories"`
}

type CreateMacroEstimationInputDTO struct {
	UserID          string `json:"user_id"`
	MealDescription string `json:"meal_description"`
}
