package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/aleroxac/projetin/internal/dto"
	web "github.com/aleroxac/projetin/internal/infra/web"
	"github.com/aleroxac/projetin/internal/service"
)

type MacroEstimationHandler struct {
	MacroEstimationService *service.MacroEstimationService
}

func NewMacroEstimationHandler(s *service.MacroEstimationService) *MacroEstimationHandler {
	return &MacroEstimationHandler{MacroEstimationService: s}
}

// Estimate godoc
// @Summary      Estimate macros from a meal description
// @Tags         macro_estimation
// @Accept       json
// @Produce      json
// @Param        body  body      dto.CreateMacroEstimationInputDTO  true  "Meal description"
// @Success      201   {object}  dto.MacroEstimationOutputDTO
// @Failure      400   {object}  map[string]string
// @Failure      500   {object}  map[string]string
// @Router       /macro-estimation [post]
func (h *MacroEstimationHandler) Estimate(w http.ResponseWriter, r *http.Request) {
	var input dto.CreateMacroEstimationInputDTO
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	result, err := h.MacroEstimationService.Estimate(r.Context(), input)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, result)
}

// GetByID godoc
// @Summary      Get macro estimation by ID
// @Tags         macro_estimation
// @Produce      json
// @Param        id  path      string  true  "MacroEstimation UUID"
// @Success      200 {object}  dto.MacroEstimationOutputDTO
// @Failure      404 {object}  map[string]string
// @Router       /macro-estimation/{id} [get]
func (h *MacroEstimationHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	result, err := h.MacroEstimationService.GetByID(r.Context(), web.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusNotFound, "macro estimation not found")
		return
	}
	writeJSON(w, http.StatusOK, result)
}

// List godoc
// @Summary      List macro estimations by user
// @Tags         macro_estimation
// @Produce      json
// @Param        user_id  query     string  true  "User UUID"
// @Success      200      {array}   dto.MacroEstimationOutputDTO
// @Failure      400      {object}  map[string]string
// @Router       /macro-estimation [get]
func (h *MacroEstimationHandler) List(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		writeError(w, http.StatusBadRequest, "missing user_id query param")
		return
	}
	result, err := h.MacroEstimationService.List(r.Context(), userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, result)
}

// Delete godoc
// @Summary      Delete macro estimation
// @Tags         macro_estimation
// @Produce      json
// @Param        id  path      string  true  "MacroEstimation UUID"
// @Success      200 {object}  map[string]string
// @Failure      500 {object}  map[string]string
// @Router       /macro-estimation/{id} [delete]
func (h *MacroEstimationHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := web.URLParam(r, "id")
	if err := h.MacroEstimationService.Delete(r.Context(), id); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"id": id, "message": "macro estimation deleted"})
}
