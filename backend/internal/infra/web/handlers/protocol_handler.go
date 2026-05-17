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

type ProtocolHandler struct {
	ProtocolService *service.ProtocolService
}

func NewProtocolHandler(protocolService *service.ProtocolService) *ProtocolHandler {
	return &ProtocolHandler{ProtocolService: protocolService}
}

// Create godoc
// @Summary      Create a new protocol
// @Tags         protocol
// @Accept       json
// @Produce      json
// @Param        protocol  body      dto.CreateProtocolInputDTO  true  "Protocol Data"
// @Success      201       {object}  map[string]string
// @Failure      400       {object}  map[string]string
// @Router       /protocol [post]
func (h *ProtocolHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input dto.CreateProtocolInputDTO
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	protocol, err := h.ProtocolService.Create(r.Context(), input)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, dto.ProtocolOutputDTO{
		ID:       protocol.ID.String(),
		GoalID:   protocol.GoalID.String(),
		Name:     protocol.Name,
		IsActive: protocol.IsActive,
	})
}

// GetByID godoc
// @Summary      Get protocol by ID
// @Tags         protocol
// @Produce      json
// @Param        id   path      string  true  "Protocol UUID"
// @Success      200  {object}  entity.Protocol
// @Failure      404  {object}  map[string]string
// @Router       /protocol/{id} [get]
func (h *ProtocolHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	p, err := h.ProtocolService.GetByID(r.Context(), web.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusNotFound, "protocol not found")
		return
	}
	writeJSON(w, http.StatusOK, dto.ProtocolOutputDTO{
		ID:       p.ID.String(),
		GoalID:   p.GoalID.String(),
		Name:     p.Name,
		IsActive: p.IsActive,
	})
}

// List godoc
// @Summary      List protocols by goal
// @Tags         protocol
// @Produce      json
// @Param        goal_id  query     string  true  "Goal UUID"
// @Success      200      {array}   entity.Protocol
// @Failure      400      {object}  map[string]string
// @Router       /protocol [get]
func (h *ProtocolHandler) List(w http.ResponseWriter, r *http.Request) {
	goalID, err := uuid.Parse(r.URL.Query().Get("goal_id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "missing or invalid goal_id query param")
		return
	}
	protocols, err := h.ProtocolService.List(r.Context(), goalID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	output := make([]dto.ProtocolOutputDTO, len(protocols))
	for i, p := range protocols {
		output[i] = dto.ProtocolOutputDTO{
			ID:       p.ID.String(),
			GoalID:   p.GoalID.String(),
			Name:     p.Name,
			IsActive: p.IsActive,
		}
	}
	writeJSON(w, http.StatusOK, output)
}

// Update godoc
// @Summary      Update protocol
// @Tags         protocol
// @Accept       json
// @Produce      json
// @Param        id        path      string                      true  "Protocol UUID"
// @Param        protocol  body      dto.UpdateProtocolInputDTO  true  "Updated Protocol Data"
// @Success      200       {object}  map[string]string
// @Failure      400       {object}  map[string]string
// @Router       /protocol/{id} [put]
func (h *ProtocolHandler) Update(w http.ResponseWriter, r *http.Request) {
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
	var input dto.UpdateProtocolInputDTO
	if err := json.Unmarshal(bodyBytes, &input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := h.ProtocolService.Update(r.Context(), web.URLParam(r, "id"), input); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "protocol updated successfully"})
}

// Delete godoc
// @Summary      Delete protocol
// @Tags         protocol
// @Produce      json
// @Param        id  path      string  true  "Protocol UUID"
// @Success      200 {object}  map[string]string
// @Failure      500 {object}  map[string]string
// @Router       /protocol/{id} [delete]
func (h *ProtocolHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := web.URLParam(r, "id")
	if err := h.ProtocolService.Delete(r.Context(), id); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"id": id, "message": "protocol deleted"})
}
