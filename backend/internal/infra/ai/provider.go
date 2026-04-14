package ai

import "context"

type MealItemEstimate struct {
	Item     string  `json:"item"`
	Quantity float64 `json:"quantity"`
	Unit     string  `json:"unit"`
	Protein  float64 `json:"protein"`
	Carbs    float64 `json:"carbs"`
	Fat      float64 `json:"fat"`
	Calories float64 `json:"calories"`
}

type AIProvider interface {
	Ping(ctx context.Context) error
	EstimateMacros(ctx context.Context, description string) ([]MealItemEstimate, error)
}
