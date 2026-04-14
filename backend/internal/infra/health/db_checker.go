package health

import (
	"context"
	"database/sql"
	"log/slog"

	"github.com/aleroxac/projetin/internal/dto"
)

type DBChecker struct {
	db *sql.DB
}

func NewDBChecker(db *sql.DB) *DBChecker {
	return &DBChecker{db: db}
}

func (c *DBChecker) Name() string { return "database" }

func (c *DBChecker) Check(ctx context.Context) dto.ComponentStatus {
	if c.db == nil {
		return dto.ComponentStatus{Status: "DOWN", Message: "driver not initialized"}
	}
	if err := c.db.PingContext(ctx); err != nil {
		slog.Error("health_check_failed", slog.String("component", c.Name()), slog.String("error", err.Error()))
		return dto.ComponentStatus{Status: "DOWN", Message: err.Error()}
	}
	return dto.ComponentStatus{Status: "UP"}
}
