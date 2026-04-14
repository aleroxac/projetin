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

type AssessmentHandler struct {
	AssessmentService *service.AssessmentService
}

func NewAssessmentHandler(assessmentService *service.AssessmentService) *AssessmentHandler {
	return &AssessmentHandler{AssessmentService: assessmentService}
}

// Create godoc
// @Summary      Create a new assessment
// @Description  Creates an assessment
// @Tags         assessment
// @Accept       json
// @Produce      json
// @Param        assessment  body      dto.CreateAssessmentInputDTO  true  "Assessment Data"
// @Success      201   {object}  map[string]string "Assessment created successfully"
// @Failure      400   {object}  map[string]string "Invalid input data"
// @Router       /assessment [post]
func (h *AssessmentHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input dto.CreateAssessmentInputDTO
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	output, err := h.AssessmentService.Create(r.Context(), input.UserID, input)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, output)
}

// GetByID godoc
// @Summary      Get assessment by ID
// @Description  Retrieves the basic information of a specific assessment.
// @Tags         assessment
// @Produce      json
// @Param        id   path      string  true  "Assessment UUID"
// @Success      200  {object}  entity.Assessment
// @Failure      404  {object}  map[string]string "Assessment not found"
// @Router       /assessment/{id} [get]
func (h *AssessmentHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := web.URLParam(r, "id")
	a, err := h.AssessmentService.GetByID(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusNotFound, "assessment not found")
		return
	}
	writeJSON(w, http.StatusOK, dto.AssessmentOutputDTO{
		ID:            a.ID.String(),
		UserID:        a.UserID.String(),
		Weight:        a.Weight,
		Height:        a.Height,
		BodyFat:       a.BodyFat,
		ActivityLevel: a.ActivityLevel,
		BMI:           a.BMI,
		BMR:           a.BMR,
		TDEE:          a.TDEE,
	})
}

// List godoc
// @Summary      List all assessments
// @Description  Retrieves a list of all registered assessment profiles sorted by name.
// @Tags         assessment
// @Produce      json
// @Success      200  {array}   entity.Assessment
// @Failure      500  {object}  map[string]string "Internal server error"
// @Param 	  		user_id  query     string  true  "User UUID to filter assessments by user"
// @Router       /assessment [get]
func (h *AssessmentHandler) List(w http.ResponseWriter, r *http.Request) {
	userID, err := uuid.Parse(r.URL.Query().Get("user_id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "missing or invalid user_id query param")
		return
	}
	assessments, err := h.AssessmentService.List(r.Context(), userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	output := make([]dto.AssessmentOutputDTO, len(assessments))
	for i, a := range assessments {
		output[i] = dto.AssessmentOutputDTO{
			ID:            a.ID.String(),
			UserID:        a.UserID.String(),
			Weight:        a.Weight,
			Height:        a.Height,
			BodyFat:       a.BodyFat,
			ActivityLevel: a.ActivityLevel,
			BMI:           a.BMI,
			BMR:           a.BMR,
			TDEE:          a.TDEE,
		}
	}
	writeJSON(w, http.StatusOK, output)
}

// Update godoc
// @Summary      Update assessment profile
// @Description  Updates the weight, height, or other data of an existing assessment.
// @Tags         assessment
// @Accept       json
// @Produce      json
// @Param        id    path      string                  true  "Assessment UUID"
// @Param        assessment  body      dto.UpdateAssessmentInputDTO  true  "Updated Assessment Data"
// @Success      200   {object}  map[string]string "Assessment updated successfully"
// @Failure      400   {object}  map[string]string "Invalid update data"
// @Router       /assessment/{id} [put]
func (h *AssessmentHandler) Update(w http.ResponseWriter, r *http.Request) {
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

	var input dto.UpdateAssessmentInputDTO
	if err := json.Unmarshal(bodyBytes, &input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.AssessmentService.Update(r.Context(), web.URLParam(r, "id"), input); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "assessment updated successfully"})
}

// History godoc
// @Summary      Assessment history (shape evolution timeline)
// @Tags         assessment
// @Produce      json
// @Param        user_id  query     string  true  "User UUID"
// @Success      200      {array}   dto.AssessmentHistoryEntryDTO
// @Failure      400      {object}  map[string]string
// @Failure      500      {object}  map[string]string
// @Router       /assessment/history [get]
func (h *AssessmentHandler) History(w http.ResponseWriter, r *http.Request) {
	userID, err := uuid.Parse(r.URL.Query().Get("user_id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "missing or invalid user_id query param")
		return
	}
	result, err := h.AssessmentService.History(r.Context(), userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, result)
}

// Delete godoc
// @Summary      Delete assessment profile
// @Description  Permanently removes an assessment and their associated data from the system.
// @Tags         assessment
// @Produce      json
// @Param        id   path      string  true  "Assessment UUID"
// @Success      204  {object}  nil "No Content"
// @Failure      500  {object}  map[string]string "Internal server error"
// @Router       /assessment/{id} [delete]
func (h *AssessmentHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := web.URLParam(r, "id")
	if err := h.AssessmentService.Delete(r.Context(), id); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"id": id, "message": "assessment deleted"})
}
