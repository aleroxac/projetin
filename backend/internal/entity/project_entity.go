package entity

import (
	"errors"

	"github.com/google/uuid"
)

type Project struct {
	ID       uuid.UUID
	UserID   uuid.UUID
	Name     string
	IsActive bool
}

func NewProject(userID uuid.UUID, name string) (*Project, error) {
	p := &Project{
		UserID:   userID,
		Name:     name,
		IsActive: true,
	}
	if err := p.Validate(); err != nil {
		return nil, err
	}
	return p, nil
}

func (p *Project) Validate() error {
	if p.Name == "" {
		return errors.New("name is required")
	}
	return nil
}

func (p *Project) UpdatePartial(name *string, isActive *bool) error {
	if name != nil {
		p.Name = *name
	}
	if isActive != nil {
		p.IsActive = *isActive
	}
	return p.Validate()
}
