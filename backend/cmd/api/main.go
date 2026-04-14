package main

import (
	"log/slog"
	"os"
)

func init() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)
}

func main() {
	app, err := NewApp()
	if err != nil {
		slog.Error("failed to initialize app", slog.Any("error", err))
		os.Exit(1)
	}
	app.Run()
}
