package gin_adapter

import (
	"log/slog"
	"time"

	"github.com/gin-gonic/gin"
)

func RecoveryMiddleware() gin.HandlerFunc {
	return gin.Recovery()
}

func LoggingMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		c.Next()

		slog.Info("http_request",
			slog.Int("status", c.Writer.Status()),
			slog.String("method", c.Request.Method),
			slog.String("path", path),
			slog.String("query", raw),
			slog.String("ip", c.ClientIP()),
			slog.Float64("latency_ms", float64(time.Since(start).Microseconds())/1000.0),
			slog.String("user_agent", c.Request.UserAgent()),
		)
	}
}
