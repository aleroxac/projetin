package entity

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID            uuid.UUID
	Name          string
	Email         string
	BiologicalSex string
	BirthDate     time.Time
}

func NewUser(name, email, sex string, birthDate time.Time) (*User, error) {
	u := &User{
		Name:          name,
		Email:         email,
		BiologicalSex: sex,
		BirthDate:     birthDate,
	}

	if err := u.Validate(); err != nil {
		return nil, err
	}

	return u, nil
}

func (u *User) Validate() error {
	if u.Name == "" {
		return errors.New("name is required")
	}
	if u.Email == "" {
		return errors.New("email is required")
	}
	if u.BiologicalSex != "male" && u.BiologicalSex != "female" {
		return errors.New("biological sex must be 'male' or 'female'")
	}
	if u.BirthDate.IsZero() {
		return errors.New("birth_date is required")
	}
	if u.BirthDate.After(time.Now()) {
		return errors.New("birth date cannot be in the future")
	}
	return nil
}

func (u *User) CalculateAge() int {
	today := time.Now()
	age := today.Year() - u.BirthDate.Year()

	if today.YearDay() < u.BirthDate.YearDay() {
		age--
	}
	return age
}

func (u *User) Update(name, email, sex string, birthDate time.Time) error {
	u.Name = name
	u.Email = email
	u.BiologicalSex = sex
	u.BirthDate = birthDate
	return u.Validate()
}

func (u *User) UpdatePartial(name, email, sex *string, birthDate *time.Time) error {
	if name != nil {
		u.Name = *name
	}
	if email != nil {
		u.Email = *email
	}
	if sex != nil {
		u.BiologicalSex = *sex
	}
	if birthDate != nil {
		u.BirthDate = *birthDate
	}
	return u.Validate()
}
