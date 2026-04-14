package health

import (
	"context"
	"log/slog"

	"github.com/aleroxac/projetin/internal/dto"
	ai "github.com/aleroxac/projetin/internal/infra/ai"
)

type AIChecker struct {
	provider ai.AIProvider
}

func NewAIChecker(provider ai.AIProvider) *AIChecker {
	return &AIChecker{provider: provider}
}

func (c *AIChecker) Name() string { return "ai_provider" }

func (c *AIChecker) Check(ctx context.Context) dto.ComponentStatus {
	if err := c.provider.Ping(ctx); err != nil {
		slog.Error("health_check_failed", slog.String("component", c.Name()), slog.String("error", err.Error()))
		return dto.ComponentStatus{Status: "DOWN", Message: err.Error()}
	}
	return dto.ComponentStatus{Status: "UP"}
}
