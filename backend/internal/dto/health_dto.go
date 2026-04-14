package dto

type ComponentStatus struct {
	Status  string `json:"status"`
	Message string `json:"message,omitempty"`
}

type ReadinessOutputDTO struct {
	Status     string                    `json:"status"`
	Components map[string]ComponentStatus `json:"components"`
}
