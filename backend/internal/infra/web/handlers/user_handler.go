package handlers

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/aleroxac/projetin/internal/dto"
	web "github.com/aleroxac/projetin/internal/infra/web"
	"github.com/aleroxac/projetin/internal/service"
)

type UserHandler struct {
	UserService *service.UserService
}

func NewUserHandler(userService *service.UserService) *UserHandler {
	return &UserHandler{UserService: userService}
}

// Create godoc
// @Summary      Create a new user profile
// @Description  Creates a user
// @Tags         user
// @Accept       json
// @Produce      json
// @Param        user  body      dto.CreateUserInputDTO  true  "User Profile Data"
// @Success      201   {object}  map[string]string "User created successfully"
// @Failure      400   {object}  map[string]string "Invalid input data"
// @Router       /user [post]
func (h *UserHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input dto.CreateUserInputDTO
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	user, err := h.UserService.Create(r.Context(), input)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, dto.UserOutputDTO{
		ID:            user.ID.String(),
		Name:          user.Name,
		Email:         user.Email,
		BiologicalSex: user.BiologicalSex,
		BirthDate:     dto.Date(user.BirthDate),
	})
}

// GetByID godoc
// @Summary      Get user profile by ID
// @Description  Retrieves the basic profile information of a specific user.
// @Tags         user
// @Produce      json
// @Param        id   path      string  true  "User UUID"
// @Success      200  {object}  entity.User
// @Failure      404  {object}  map[string]string "User not found"
// @Router       /user/{id} [get]
func (h *UserHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := web.URLParam(r, "id")
	user, err := h.UserService.GetByID(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusNotFound, "user not found")
		return
	}
	writeJSON(w, http.StatusOK, dto.UserOutputDTO{
		ID:            user.ID.String(),
		Name:          user.Name,
		Email:         user.Email,
		BiologicalSex: user.BiologicalSex,
		BirthDate:     dto.Date(user.BirthDate),
	})
}

// List godoc
// @Summary      List all users
// @Description  Retrieves a list of all registered user profiles sorted by name.
// @Tags         user
// @Produce      json
// @Success      200  {array}   entity.User
// @Failure      500  {object}  map[string]string "Internal server error"
// @Router       /user [get]
func (h *UserHandler) List(w http.ResponseWriter, r *http.Request) {
	users, err := h.UserService.List(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	output := make([]dto.UserOutputDTO, len(users))
	for i, u := range users {
		output[i] = dto.UserOutputDTO{
			ID:            u.ID.String(),
			Name:          u.Name,
			Email:         u.Email,
			BiologicalSex: u.BiologicalSex,
			BirthDate:     dto.Date(u.BirthDate),
		}
	}
	writeJSON(w, http.StatusOK, output)
}

// Update godoc
// @Summary      Update user profile
// @Description  Updates the name, email, or biological data of an existing user.
// @Tags         user
// @Accept       json
// @Produce      json
// @Param        id    path      string                  true  "User UUID"
// @Param        user  body      dto.UpdateUserInputDTO  true  "Updated User Data"
// @Success      200   {object}  map[string]string "User updated successfully"
// @Failure      400   {object}  map[string]string "Invalid update data"
// @Router       /user/{id} [put]
func (h *UserHandler) Update(w http.ResponseWriter, r *http.Request) {
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

	var input dto.UpdateUserInputDTO
	if err := json.Unmarshal(bodyBytes, &input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.UserService.Update(r.Context(), web.URLParam(r, "id"), input); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "user updated successfully"})
}

// Delete godoc
// @Summary      Delete user profile
// @Description  Permanently removes a user and their associated data from the system.
// @Tags         user
// @Produce      json
// @Param        id   path      string  true  "User UUID"
// @Success      204  {object}  nil "No Content"
// @Failure      500  {object}  map[string]string "Internal server error"
// @Router       /user/{id} [delete]
func (h *UserHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := web.URLParam(r, "id")
	if err := h.UserService.Delete(r.Context(), id); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"id": id, "message": "user deleted"})
}
