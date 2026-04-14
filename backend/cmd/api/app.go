package main

import (
	"context"
	"database/sql"
	"fmt"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/aleroxac/projetin/configs"
	ai "github.com/aleroxac/projetin/internal/infra/ai"
	"github.com/aleroxac/projetin/internal/infra/ai/anthropic"
	"github.com/aleroxac/projetin/internal/infra/ai/gemini"
	"github.com/aleroxac/projetin/internal/infra/ai/ollama"
	"github.com/aleroxac/projetin/internal/infra/ai/openai"
	db_postgresql "github.com/aleroxac/projetin/internal/infra/database/postgresql"
	"github.com/aleroxac/projetin/internal/infra/health"
	web "github.com/aleroxac/projetin/internal/infra/web"
	gin_adapter "github.com/aleroxac/projetin/internal/infra/web/adapters/gin"
	"github.com/aleroxac/projetin/internal/infra/web/handlers"
	"github.com/aleroxac/projetin/internal/infra/web/routes"
	"github.com/aleroxac/projetin/internal/service"
)

type App struct {
	config *configs.Config
	db     *sql.DB
	server web.WebServer
}

func NewApp() (*App, error) {
	config, err := configs.LoadConfig(".")
	if err != nil {
		return nil, fmt.Errorf("load config: %w", err)
	}

	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		config.DBHost, config.DBPort, config.DBUser, config.DBPassword, config.DBName)
	db, err := sql.Open(config.DBDriver, dsn)
	if err != nil {
		return nil, fmt.Errorf("open database: %w", err)
	}

	// User: Repositories and Services
	userRepo := db_postgresql.NewSQLCUserRepository(db)
	userService := service.NewUserService(userRepo)

	// Assessment: Repositories and Services
	assessmentRepo := db_postgresql.NewSQLCAssessmentRepository(db)
	assessmentService := service.NewAssessmentService(assessmentRepo, userRepo)

	// Project, Goal, Protocol: Repositories and Services
	projectRepo := db_postgresql.NewSQLCProjectRepository(db)
	projectService := service.NewProjectService(projectRepo)

	goalRepo := db_postgresql.NewSQLCGoalRepository(db)
	goalService := service.NewGoalService(goalRepo)

	protocolRepo := db_postgresql.NewSQLCProtocolRepository(db)
	protocolService := service.NewProtocolService(protocolRepo)

	dietPlanRepo := db_postgresql.NewSQLCDietPlanRepository(db)
	mealLogRepo := db_postgresql.NewSQLCMealLogRepository(db)
	dietPlanService := service.NewDietPlanService(dietPlanRepo, protocolRepo, goalRepo, projectRepo, assessmentRepo, mealLogRepo)

	// MacroEstimation: AI provider + Repository + Service
	var aiProvider ai.AIProvider
	switch config.AIProvider {
	case "anthropic":
		aiProvider = anthropic.NewProvider(config.AIENDPOINT, config.AIModel, config.AIAPIKey)
	case "gemini":
		aiProvider = gemini.NewProvider(config.AIENDPOINT, config.AIModel, config.AIAPIKey)
	case "ollama":
		aiProvider = ollama.NewProvider(config.AIENDPOINT, config.AIModel)
	case "openai":
		aiProvider = openai.NewProvider(config.AIENDPOINT, config.AIModel, config.AIAPIKey)
	default:
		return nil, fmt.Errorf("unsupported AI provider: %q (supported: anthropic, gemini, ollama, openai)", config.AIProvider)
	}
	macroEstimationRepo := db_postgresql.NewSQLCMacroEstimationRepository(db)
	macroEstimationService := service.NewMacroEstimationService(macroEstimationRepo, userRepo, aiProvider)

	// MealLog: Repository and Service
	mealLogService := service.NewMealLogService(mealLogRepo, userRepo, aiProvider)

	// Health: checkers + service
	healthSvc := service.NewHealthService(
		health.NewDBChecker(db),
		health.NewAIChecker(aiProvider),
	)

	// Handlers
	healthH := handlers.NewHealthHandler(healthSvc)
	userH := handlers.NewUserHandler(userService)
	assessmentH := handlers.NewAssessmentHandler(assessmentService)
	projectH := handlers.NewProjectHandler(projectService)
	goalH := handlers.NewGoalHandler(goalService)
	protocolH := handlers.NewProtocolHandler(protocolService)
	dietPlanH := handlers.NewDietPlanHandler(dietPlanService)
	macroEstimationH := handlers.NewMacroEstimationHandler(macroEstimationService)
	mealLogH := handlers.NewMealLogHandler(mealLogService)

	r := gin_adapter.NewRouter()
	r.Use(gin_adapter.LoggingMiddleware(), gin_adapter.RecoveryMiddleware())
	r.MountSwagger("/api/v1/docs")
	routes.RegisterRoutes(r, healthH, userH, assessmentH, projectH, goalH, protocolH, dietPlanH, macroEstimationH, mealLogH)

	return &App{
		config: config,
		db:     db,
		server: gin_adapter.NewServer(r),
	}, nil
}

func (a *App) Run() {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		if err := a.server.Start(a.config.APIHost, a.config.APIPort); err != nil {
			slog.Error("server_stopped", slog.Any("error", err))
			quit <- syscall.SIGTERM
		}
	}()

	<-quit
	slog.Info("shutdown_initiated")
	a.shutdown()
}

func (a *App) shutdown() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := a.server.Shutdown(ctx); err != nil {
		slog.Error("server_shutdown_error", slog.Any("error", err))
	}
	if err := a.db.Close(); err != nil {
		slog.Error("db_close_error", slog.Any("error", err))
	}
	slog.Info("shutdown_complete")
}
