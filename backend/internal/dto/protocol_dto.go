package dto

import "github.com/google/uuid"

type ProtocolOutputDTO struct {
	ID       string `json:"id"`
	GoalID   string `json:"goal_id"`
	Name     string `json:"name"`
	IsActive bool   `json:"is_active"`
}

type CreateProtocolInputDTO struct {
	GoalID uuid.UUID `json:"goal_id"`
	Name   string    `json:"name"`
}

type UpdateProtocolInputDTO struct {
	Name     *string `json:"name"`
	IsActive *bool   `json:"is_active"`
}
