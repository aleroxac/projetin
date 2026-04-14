package handlers

import (
	"log/slog"
	"net/http"

	"github.com/aleroxac/projetin/internal/service"
)

type HealthHandler struct {
	svc *service.HealthService
}

func NewHealthHandler(svc *service.HealthService) *HealthHandler {
	return &HealthHandler{svc: svc}
}

// Liveness godoc
// @Summary      Checks if the app is alive
// @Description  Basic health check
// @Tags         health
// @Produce      json
// @Success      200  {object}  map[string]string
// @Router       /health/liveness [get]
func (h *HealthHandler) Liveness(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "UP"})
}

// Readiness godoc
// @Summary      Checks if the app is ready
// @Description  Per-component health check: database, ai_provider
// @Tags         health
// @Produce      json
// @Success      200  {object}  dto.ReadinessOutputDTO
// @Failure      503  {object}  dto.ReadinessOutputDTO
// @Router       /health/readiness [get]
func (h *HealthHandler) Readiness(w http.ResponseWriter, r *http.Request) {
	result := h.svc.CheckReadiness(r.Context())

	status := http.StatusOK
	if result.Status != "READY" {
		slog.Warn("readiness_check_failed", slog.String("status", result.Status))
		status = http.StatusServiceUnavailable
	}

	writeJSON(w, status, result)
}
