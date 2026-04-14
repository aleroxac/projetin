package dto

import (
	"fmt"
	"time"
)

const dateLayout = "2006-01-02"

type Date time.Time

func (d Date) MarshalJSON() ([]byte, error) {
	return []byte(`"` + time.Time(d).Format(dateLayout) + `"`), nil
}

func (d *Date) UnmarshalJSON(data []byte) error {
	s := string(data)
	if s == "null" {
		return nil
	}
	if len(s) < 2 || s[0] != '"' || s[len(s)-1] != '"' {
		return fmt.Errorf("birth_date must be a string in YYYY-MM-DD format")
	}
	t, err := time.Parse(dateLayout, s[1:len(s)-1])
	if err != nil {
		return fmt.Errorf("birth_date must be in YYYY-MM-DD format: %w", err)
	}
	*d = Date(t)
	return nil
}

type UserOutputDTO struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	Email         string `json:"email"`
	BiologicalSex string `json:"biological_sex"`
	BirthDate     Date   `json:"birth_date"`
}

type CreateUserInputDTO struct {
	Name          string `json:"name"`
	Email         string `json:"email"`
	BiologicalSex string `json:"biological_sex"`
	BirthDate     Date   `json:"birth_date"`
}

type UpdateUserInputDTO struct {
	Name          *string `json:"name"`
	Email         *string `json:"email"`
	BiologicalSex *string `json:"biological_sex"`
	BirthDate     *Date   `json:"birth_date"`
}
