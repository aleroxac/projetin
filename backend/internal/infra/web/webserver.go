package web

import "context"

type WebServer interface {
	Start(host string, port string) error
	Shutdown(ctx context.Context) error
}
