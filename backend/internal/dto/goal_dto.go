package dto

import "github.com/google/uuid"

type GoalOutputDTO struct {
	ID           string `json:"id"`
	ProjectID    string `json:"project_id"`
	Name         string `json:"name"`
	StrategyType string `json:"strategy_type"`
	IsActive     bool   `json:"is_active"`
}

type CreateGoalInputDTO struct {
	ProjectID    uuid.UUID `json:"project_id"`
	Name         string    `json:"name"`
	StrategyType string    `json:"strategy_type"`
}

type UpdateGoalInputDTO struct {
	Name         *string `json:"name"`
	StrategyType *string `json:"strategy_type"`
	IsActive     *bool   `json:"is_active"`
}
