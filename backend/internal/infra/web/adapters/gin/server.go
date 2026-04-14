package gin_adapter

import (
	"context"
	"log/slog"
	"net/http"

	"github.com/aleroxac/projetin/docs"
)

type GinServer struct {
	router     *GinRouter
	httpServer *http.Server
}

func NewServer(router *GinRouter) *GinServer {
	return &GinServer{router: router}
}

func (s *GinServer) Start(host string, port string) error {
	docs.SwaggerInfo.BasePath = "/api/v1"
	addr := host + ":" + port
	s.httpServer = &http.Server{
		Addr:    addr,
		Handler: s.router,
	}
	slog.Info("server_starting", slog.String("address", addr))
	return s.httpServer.ListenAndServe()
}

func (s *GinServer) Shutdown(ctx context.Context) error {
	return s.httpServer.Shutdown(ctx)
}
