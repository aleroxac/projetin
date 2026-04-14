package entity

import (
	"errors"

	"github.com/google/uuid"
)

var ValidStrategyTypes = []string{"recomposition", "cut", "bulk", "maintain"}

type Goal struct {
	ID           uuid.UUID
	ProjectID    uuid.UUID
	Name         string
	StrategyType string
	IsActive     bool
}

func NewGoal(projectID uuid.UUID, name, strategyType string) (*Goal, error) {
	g := &Goal{
		ProjectID:    projectID,
		Name:         name,
		StrategyType: strategyType,
		IsActive:     true,
	}
	if err := g.Validate(); err != nil {
		return nil, err
	}
	return g, nil
}

func (g *Goal) Validate() error {
	if g.Name == "" {
		return errors.New("name is required")
	}
	for _, v := range ValidStrategyTypes {
		if g.StrategyType == v {
			return nil
		}
	}
	return errors.New("strategy_type must be one of: recomposition, cut, bulk, maintain")
}

func (g *Goal) UpdatePartial(name, strategyType *string, isActive *bool) error {
	if name != nil {
		g.Name = *name
	}
	if strategyType != nil {
		g.StrategyType = *strategyType
	}
	if isActive != nil {
		g.IsActive = *isActive
	}
	return g.Validate()
}
