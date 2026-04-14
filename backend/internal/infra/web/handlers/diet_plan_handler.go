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

type DietPlanHandler struct {
	DietPlanService *service.DietPlanService
}

func NewDietPlanHandler(dietPlanService *service.DietPlanService) *DietPlanHandler {
	return &DietPlanHandler{DietPlanService: dietPlanService}
}

// Create godoc
// @Summary      Create a new diet plan
// @Tags         diet_plan
// @Accept       json
// @Produce      json
// @Param        diet_plan  body      dto.CreateDietPlanInputDTO  true  "Diet Plan Data"
// @Success      201        {object}  map[string]string
// @Failure      400        {object}  map[string]string
// @Router       /diet-plan [post]
func (h *DietPlanHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input dto.CreateDietPlanInputDTO
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := h.DietPlanService.Create(r.Context(), input); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, map[string]string{"message": "diet plan created successfully"})
}

// GetByID godoc
// @Summary      Get diet plan by ID
// @Tags         diet_plan
// @Produce      json
// @Param        id  path      string  true  "Diet Plan UUID"
// @Success      200 {object}  dto.DietPlanOutputDTO
// @Failure      404 {object}  map[string]string
// @Router       /diet-plan/{id} [get]
func (h *DietPlanHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	d, err := h.DietPlanService.GetByID(r.Context(), web.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusNotFound, "diet plan not found")
		return
	}
	writeJSON(w, http.StatusOK, dto.DietPlanOutputDTO{
		ID:               d.ID.String(),
		ProtocolID:       d.ProtocolID.String(),
		CalorieIntensity: string(d.CalorieIntensity),
		ProteinIntensity: string(d.ProteinIntensity),
		FatIntensity:    string(d.FatIntensity),
		Protein:          d.Protein,
		Carbs:            d.Carbs,
		Fat:              d.Fat,
		Calories:         d.Calories,
		Water:            d.Water,
		IsActive:         d.IsActive,
	})
}

// List godoc
// @Summary      List diet plans by protocol
// @Tags         diet_plan
// @Produce      json
// @Param        protocol_id  query     string  true  "Protocol UUID"
// @Success      200          {array}   dto.DietPlanOutputDTO
// @Failure      400          {object}  map[string]string
// @Router       /diet-plan [get]
func (h *DietPlanHandler) List(w http.ResponseWriter, r *http.Request) {
	protocolID, err := uuid.Parse(r.URL.Query().Get("protocol_id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "missing or invalid protocol_id query param")
		return
	}
	plans, err := h.DietPlanService.List(r.Context(), protocolID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	output := make([]dto.DietPlanOutputDTO, len(plans))
	for i, d := range plans {
		output[i] = dto.DietPlanOutputDTO{
			ID:               d.ID.String(),
			ProtocolID:       d.ProtocolID.String(),
			CalorieIntensity: string(d.CalorieIntensity),
			ProteinIntensity: string(d.ProteinIntensity),
			FatIntensity:    string(d.FatIntensity),
			Protein:          d.Protein,
			Carbs:            d.Carbs,
			Fat:              d.Fat,
			Calories:         d.Calories,
			Water:            d.Water,
			IsActive:         d.IsActive,
		}
	}
	writeJSON(w, http.StatusOK, output)
}

// Update godoc
// @Summary      Update diet plan
// @Tags         diet_plan
// @Accept       json
// @Produce      json
// @Param        id         path      string                      true  "Diet Plan UUID"
// @Param        diet_plan  body      dto.UpdateDietPlanInputDTO  true  "Updated Diet Plan Data"
// @Success      200        {object}  map[string]string
// @Failure      400        {object}  map[string]string
// @Router       /diet-plan/{id} [put]
func (h *DietPlanHandler) Update(w http.ResponseWriter, r *http.Request) {
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
	var input dto.UpdateDietPlanInputDTO
	if err := json.Unmarshal(bodyBytes, &input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := h.DietPlanService.Update(r.Context(), web.URLParam(r, "id"), input); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "diet plan updated successfully"})
}

// Adherence godoc
// @Summary      Diet plan adherence for today
// @Tags         diet_plan
// @Produce      json
// @Param        diet_plan_id  query     string  true  "Diet Plan UUID"
// @Param        user_id       query     string  true  "User UUID"
// @Success      200           {object}  dto.DietPlanAdherenceOutputDTO
// @Failure      400           {object}  map[string]string
// @Failure      500           {object}  map[string]string
// @Router       /diet-plan/adherence [get]
func (h *DietPlanHandler) Adherence(w http.ResponseWriter, r *http.Request) {
	dietPlanID := r.URL.Query().Get("diet_plan_id")
	userID := r.URL.Query().Get("user_id")
	if dietPlanID == "" || userID == "" {
		writeError(w, http.StatusBadRequest, "missing diet_plan_id or user_id query params")
		return
	}
	result, err := h.DietPlanService.Adherence(r.Context(), dietPlanID, userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, result)
}

// Delete godoc
// @Summary      Delete diet plan
// @Tags         diet_plan
// @Produce      json
// @Param        id  path      string  true  "Diet Plan UUID"
// @Success      200 {object}  map[string]string
// @Failure      500 {object}  map[string]string
// @Router       /diet-plan/{id} [delete]
func (h *DietPlanHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := web.URLParam(r, "id")
	if err := h.DietPlanService.Delete(r.Context(), id); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"id": id, "message": "diet plan deleted"})
}
