package dto

import "github.com/google/uuid"

type ProjectOutputDTO struct {
	ID       string `json:"id"`
	UserID   string `json:"user_id"`
	Name     string `json:"name"`
	IsActive bool   `json:"is_active"`
}

type CreateProjectInputDTO struct {
	UserID uuid.UUID `json:"user_id"`
	Name   string    `json:"name"`
}

type UpdateProjectInputDTO struct {
	Name     *string `json:"name"`
	IsActive *bool   `json:"is_active"`
}
