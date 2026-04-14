package entity

import (
	"errors"

	"github.com/google/uuid"
)

type Protocol struct {
	ID       uuid.UUID
	GoalID   uuid.UUID
	Name     string
	IsActive bool
}

func NewProtocol(goalID uuid.UUID, name string) (*Protocol, error) {
	p := &Protocol{
		GoalID:   goalID,
		Name:     name,
		IsActive: true,
	}
	if err := p.Validate(); err != nil {
		return nil, err
	}
	return p, nil
}

func (p *Protocol) Validate() error {
	if p.Name == "" {
		return errors.New("name is required")
	}
	return nil
}

func (p *Protocol) UpdatePartial(name *string, isActive *bool) error {
	if name != nil {
		p.Name = *name
	}
	if isActive != nil {
		p.IsActive = *isActive
	}
	return p.Validate()
}
