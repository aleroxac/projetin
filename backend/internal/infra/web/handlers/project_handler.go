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

type ProjectHandler struct {
	ProjectService *service.ProjectService
}

func NewProjectHandler(projectService *service.ProjectService) *ProjectHandler {
	return &ProjectHandler{ProjectService: projectService}
}

// Create godoc
// @Summary      Create a new project
// @Description  Creates a project for a user
// @Tags         project
// @Accept       json
// @Produce      json
// @Param        project  body      dto.CreateProjectInputDTO  true  "Project Data"
// @Success      201      {object}  map[string]string
// @Failure      400      {object}  map[string]string
// @Router       /project [post]
func (h *ProjectHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input dto.CreateProjectInputDTO
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	project, err := h.ProjectService.Create(r.Context(), input)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, dto.ProjectOutputDTO{
		ID:       project.ID.String(),
		UserID:   project.UserID.String(),
		Name:     project.Name,
		IsActive: project.IsActive,
	})
}

// GetByID godoc
// @Summary      Get project by ID
// @Tags         project
// @Produce      json
// @Param        id   path      string  true  "Project UUID"
// @Success      200  {object}  entity.Project
// @Failure      404  {object}  map[string]string
// @Router       /project/{id} [get]
func (h *ProjectHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	p, err := h.ProjectService.GetByID(r.Context(), web.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusNotFound, "project not found")
		return
	}
	writeJSON(w, http.StatusOK, dto.ProjectOutputDTO{
		ID:       p.ID.String(),
		UserID:   p.UserID.String(),
		Name:     p.Name,
		IsActive: p.IsActive,
	})
}

// List godoc
// @Summary      List projects by user
// @Tags         project
// @Produce      json
// @Param        user_id  query     string  true  "User UUID"
// @Success      200      {array}   entity.Project
// @Failure      400      {object}  map[string]string
// @Router       /project [get]
func (h *ProjectHandler) List(w http.ResponseWriter, r *http.Request) {
	userID, err := uuid.Parse(r.URL.Query().Get("user_id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "missing or invalid user_id query param")
		return
	}
	projects, err := h.ProjectService.List(r.Context(), userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	output := make([]dto.ProjectOutputDTO, len(projects))
	for i, p := range projects {
		output[i] = dto.ProjectOutputDTO{
			ID:       p.ID.String(),
			UserID:   p.UserID.String(),
			Name:     p.Name,
			IsActive: p.IsActive,
		}
	}
	writeJSON(w, http.StatusOK, output)
}

// Update godoc
// @Summary      Update project
// @Tags         project
// @Accept       json
// @Produce      json
// @Param        id       path      string                     true  "Project UUID"
// @Param        project  body      dto.UpdateProjectInputDTO  true  "Updated Project Data"
// @Success      200      {object}  map[string]string
// @Failure      400      {object}  map[string]string
// @Router       /project/{id} [put]
func (h *ProjectHandler) Update(w http.ResponseWriter, r *http.Request) {
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
	var input dto.UpdateProjectInputDTO
	if err := json.Unmarshal(bodyBytes, &input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := h.ProjectService.Update(r.Context(), web.URLParam(r, "id"), input); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "project updated successfully"})
}

// Delete godoc
// @Summary      Delete project
// @Tags         project
// @Produce      json
// @Param        id  path      string  true  "Project UUID"
// @Success      200 {object}  map[string]string
// @Failure      500 {object}  map[string]string
// @Router       /project/{id} [delete]
func (h *ProjectHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := web.URLParam(r, "id")
	if err := h.ProjectService.Delete(r.Context(), id); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"id": id, "message": "project deleted"})
}
