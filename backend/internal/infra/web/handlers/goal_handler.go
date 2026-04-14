package handlers

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/aleroxac/projetin/internal/dto"
	web "github.com/aleroxac/projetin/internal/infra/web"
	"github.com/aleroxac/projetin/internal/service"
	"github.com/google/uuid"
)

type GoalHandler struct {
	GoalService *service.GoalService
}

func NewGoalHandler(goalService *service.GoalService) *GoalHandler {
	return &GoalHandler{GoalService: goalService}
}

// Create godoc
// @Summary      Create a new goal
// @Tags         goal
// @Accept       json
// @Produce      json
// @Param        goal  body      dto.CreateGoalInputDTO  true  "Goal Data"
// @Success      201   {object}  map[string]string
// @Failure      400   {object}  map[string]string
// @Router       /goal [post]
func (h *GoalHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input dto.CreateGoalInputDTO
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := h.GoalService.Create(r.Context(), input); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, map[string]string{"message": "goal created successfully"})
}

// GetByID godoc
// @Summary      Get goal by ID
// @Tags         goal
// @Produce      json
// @Param        id   path      string  true  "Goal UUID"
// @Success      200  {object}  entity.Goal
// @Failure      404  {object}  map[string]string
// @Router       /goal/{id} [get]
func (h *GoalHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	g, err := h.GoalService.GetByID(r.Context(), web.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusNotFound, "goal not found")
		return
	}
	writeJSON(w, http.StatusOK, dto.GoalOutputDTO{
		ID:           g.ID.String(),
		ProjectID:    g.ProjectID.String(),
		Name:         g.Name,
		StrategyType: g.StrategyType,
		IsActive:     g.IsActive,
	})
}

// List godoc
// @Summary      List goals by project
// @Tags         goal
// @Produce      json
// @Param        project_id  query     string  true  "Project UUID"
// @Success      200         {array}   entity.Goal
// @Failure      400         {object}  map[string]string
// @Router       /goal [get]
func (h *GoalHandler) List(w http.ResponseWriter, r *http.Request) {
	projectID, err := uuid.Parse(r.URL.Query().Get("project_id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "missing or invalid project_id query param")
		return
	}
	goals, err := h.GoalService.List(r.Context(), projectID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	output := make([]dto.GoalOutputDTO, len(goals))
	for i, g := range goals {
		output[i] = dto.GoalOutputDTO{
			ID:           g.ID.String(),
			ProjectID:    g.ProjectID.String(),
			Name:         g.Name,
			StrategyType: g.StrategyType,
			IsActive:     g.IsActive,
		}
	}
	writeJSON(w, http.StatusOK, output)
}

// Update godoc
// @Summary      Update goal
// @Tags         goal
// @Accept       json
// @Produce      json
// @Param        id    path      string                  true  "Goal UUID"
// @Param        goal  body      dto.UpdateGoalInputDTO  true  "Updated Goal Data"
// @Success      200   {object}  map[string]string
// @Failure      400   {object}  map[string]string
// @Router       /goal/{id} [put]
func (h *GoalHandler) Update(w http.ResponseWriter, r *http.Request) {
	bodyBytes, err := io.ReadAll(r.Body)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	var forbidden struct {
		ID *string `json:"id"`
	}
	json.Unmarshal(bodyBytes, &forbidden) //nolint:errcheck
	if forbidden.ID != nil {
		writeError(w, http.StatusUnprocessableEntity, "field 'id' cannot be updated")
		return
	}
	var input dto.UpdateGoalInputDTO
	if err := json.Unmarshal(bodyBytes, &input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := h.GoalService.Update(r.Context(), web.URLParam(r, "id"), input); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "goal updated successfully"})
}

// Delete godoc
// @Summary      Delete goal
// @Tags         goal
// @Produce      json
// @Param        id  path      string  true  "Goal UUID"
// @Success      200 {object}  map[string]string
// @Failure      500 {object}  map[string]string
// @Router       /goal/{id} [delete]
func (h *GoalHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := web.URLParam(r, "id")
	if err := h.GoalService.Delete(r.Context(), id); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"id": id, "message": "goal deleted"})
}
