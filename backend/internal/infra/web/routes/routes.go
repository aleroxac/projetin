package routes

import (
	"net/http"

	"github.com/aleroxac/projetin/internal/infra/web"
	"github.com/aleroxac/projetin/internal/infra/web/handlers"
)

func RegisterRoutes(
	r web.Router,
	healthH *handlers.HealthHandler,
	userH *handlers.UserHandler,
	assessmentH *handlers.AssessmentHandler,
	projectH *handlers.ProjectHandler,
	goalH *handlers.GoalHandler,
	protocolH *handlers.ProtocolHandler,
	dietPlanH *handlers.DietPlanHandler,
	macroEstimationH *handlers.MacroEstimationHandler,
	mealLogH *handlers.MealLogHandler,
) {
	v1 := r.Group("/api/v1")

	health := v1.Group("/health")
	health.Handle(http.MethodGet, "/liveness", healthH.Liveness)
	health.Handle(http.MethodGet, "/readiness", healthH.Readiness)

	user := v1.Group("/user")
	user.Handle(http.MethodPost, "/", userH.Create)
	user.Handle(http.MethodGet, "/", userH.List)
	user.Handle(http.MethodGet, "/:id", userH.GetByID)
	user.Handle(http.MethodPut, "/:id", userH.Update)
	user.Handle(http.MethodDelete, "/:id", userH.Delete)

	assessment := v1.Group("/assessment")
	assessment.Handle(http.MethodPost, "/", assessmentH.Create)
	assessment.Handle(http.MethodGet, "/", assessmentH.List)
	assessment.Handle(http.MethodGet, "/history", assessmentH.History)
	assessment.Handle(http.MethodGet, "/:id", assessmentH.GetByID)
	assessment.Handle(http.MethodPut, "/:id", assessmentH.Update)
	assessment.Handle(http.MethodDelete, "/:id", assessmentH.Delete)

	project := v1.Group("/project")
	project.Handle(http.MethodPost, "/", projectH.Create)
	project.Handle(http.MethodGet, "/", projectH.List)
	project.Handle(http.MethodGet, "/:id", projectH.GetByID)
	project.Handle(http.MethodPut, "/:id", projectH.Update)
	project.Handle(http.MethodDelete, "/:id", projectH.Delete)

	goal := v1.Group("/goal")
	goal.Handle(http.MethodPost, "/", goalH.Create)
	goal.Handle(http.MethodGet, "/", goalH.List)
	goal.Handle(http.MethodGet, "/:id", goalH.GetByID)
	goal.Handle(http.MethodPut, "/:id", goalH.Update)
	goal.Handle(http.MethodDelete, "/:id", goalH.Delete)

	protocol := v1.Group("/protocol")
	protocol.Handle(http.MethodPost, "/", protocolH.Create)
	protocol.Handle(http.MethodGet, "/", protocolH.List)
	protocol.Handle(http.MethodGet, "/:id", protocolH.GetByID)
	protocol.Handle(http.MethodPut, "/:id", protocolH.Update)
	protocol.Handle(http.MethodDelete, "/:id", protocolH.Delete)

	dietPlan := v1.Group("/diet-plan")
	dietPlan.Handle(http.MethodPost, "/", dietPlanH.Create)
	dietPlan.Handle(http.MethodGet, "/", dietPlanH.List)
	dietPlan.Handle(http.MethodGet, "/adherence", dietPlanH.Adherence)
	dietPlan.Handle(http.MethodGet, "/:id", dietPlanH.GetByID)
	dietPlan.Handle(http.MethodPut, "/:id", dietPlanH.Update)
	dietPlan.Handle(http.MethodDelete, "/:id", dietPlanH.Delete)

	macroEstimation := v1.Group("/macro-estimation")
	macroEstimation.Handle(http.MethodPost, "/", macroEstimationH.Estimate)
	macroEstimation.Handle(http.MethodGet, "/", macroEstimationH.List)
	macroEstimation.Handle(http.MethodGet, "/:id", macroEstimationH.GetByID)
	macroEstimation.Handle(http.MethodDelete, "/:id", macroEstimationH.Delete)

	mealLog := v1.Group("/meal-log")
	mealLog.Handle(http.MethodPost, "/", mealLogH.Create)
	mealLog.Handle(http.MethodGet, "/", mealLogH.List)
	mealLog.Handle(http.MethodGet, "/history", mealLogH.History)
	mealLog.Handle(http.MethodGet, "/:id", mealLogH.GetByID)
	mealLog.Handle(http.MethodPut, "/:id", mealLogH.Update)
	mealLog.Handle(http.MethodDelete, "/:id", mealLogH.Delete)
}
