package service

import (
	"context"

	"github.com/aleroxac/projetin/internal/dto"
)

type Checker interface {
	Name() string
	Check(ctx context.Context) dto.ComponentStatus
}

type HealthService struct {
	checkers []Checker
}

func NewHealthService(checkers ...Checker) *HealthService {
	return &HealthService{checkers: checkers}
}

func (s *HealthService) CheckReadiness(ctx context.Context) dto.ReadinessOutputDTO {
	components := make(map[string]dto.ComponentStatus, len(s.checkers))
	allUp := true

	for _, c := range s.checkers {
		status := c.Check(ctx)
		components[c.Name()] = status
		if status.Status != "UP" {
			allUp = false
		}
	}

	overall := "READY"
	if !allUp {
		overall = "NOT_READY"
	}
	return dto.ReadinessOutputDTO{Status: overall, Components: components}
}
