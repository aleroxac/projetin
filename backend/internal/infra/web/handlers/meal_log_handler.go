package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/aleroxac/projetin/internal/dto"
	web "github.com/aleroxac/projetin/internal/infra/web"
	"github.com/aleroxac/projetin/internal/service"
)

type MealLogHandler struct {
	MealLogService *service.MealLogService
}

func NewMealLogHandler(s *service.MealLogService) *MealLogHandler {
	return &MealLogHandler{MealLogService: s}
}

// Create godoc
// @Summary      Create a meal log
// @Tags         meal_log
// @Accept       json
// @Produce      json
// @Param        body  body      dto.CreateMealLogInputDTO  true  "Meal log data"
// @Success      201   {object}  dto.MealLogOutputDTO
// @Failure      400   {object}  map[string]string
// @Failure      500   {object}  map[string]string
// @Router       /meal-log [post]
func (h *MealLogHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input dto.CreateMealLogInputDTO
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	result, err := h.MealLogService.Create(r.Context(), input)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, result)
}

// GetByID godoc
// @Summary      Get meal log by ID
// @Tags         meal_log
// @Produce      json
// @Param        id  path      string  true  "MealLog UUID"
// @Success      200 {object}  dto.MealLogOutputDTO
// @Failure      404 {object}  map[string]string
// @Router       /meal-log/{id} [get]
func (h *MealLogHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	result, err := h.MealLogService.GetByID(r.Context(), web.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusNotFound, "meal log not found")
		return
	}
	writeJSON(w, http.StatusOK, result)
}

// List godoc
// @Summary      List meal logs by user
// @Tags         meal_log
// @Produce      json
// @Param        user_id  query     string  true  "User UUID"
// @Success      200      {array}   dto.MealLogOutputDTO
// @Failure      400      {object}  map[string]string
// @Router       /meal-log [get]
func (h *MealLogHandler) List(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		writeError(w, http.StatusBadRequest, "missing user_id query param")
		return
	}
	result, err := h.MealLogService.List(r.Context(), userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, result)
}

// Update godoc
// @Summary      Update a meal log
// @Tags         meal_log
// @Accept       json
// @Produce      json
// @Param        id    path      string                    true  "MealLog UUID"
// @Param        body  body      dto.UpdateMealLogInputDTO true  "Updated fields"
// @Success      200   {object}  dto.MealLogOutputDTO
// @Failure      400   {object}  map[string]string
// @Failure      500   {object}  map[string]string
// @Router       /meal-log/{id} [put]
func (h *MealLogHandler) Update(w http.ResponseWriter, r *http.Request) {
	var input dto.UpdateMealLogInputDTO
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	result, err := h.MealLogService.Update(r.Context(), web.URLParam(r, "id"), input)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, result)
}

// History godoc
// @Summary      Meal log timeline grouped by day
// @Tags         meal_log
// @Produce      json
// @Param        user_id  query     string  true  "User UUID"
// @Success      200      {array}   dto.MealLogHistoryDayDTO
// @Failure      400      {object}  map[string]string
// @Router       /meal-log/history [get]
func (h *MealLogHandler) History(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		writeError(w, http.StatusBadRequest, "missing user_id query param")
		return
	}
	result, err := h.MealLogService.History(r.Context(), userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, result)
}

// Delete godoc
// @Summary      Delete a meal log
// @Tags         meal_log
// @Produce      json
// @Param        id  path      string  true  "MealLog UUID"
// @Success      200 {object}  map[string]string
// @Failure      500 {object}  map[string]string
// @Router       /meal-log/{id} [delete]
func (h *MealLogHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := web.URLParam(r, "id")
	if err := h.MealLogService.Delete(r.Context(), id); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"id": id, "message": "meal log deleted"})
}
