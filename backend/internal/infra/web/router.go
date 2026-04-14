package web

import (
	"context"
	"net/http"
)

type Router interface {
	http.Handler
	Handle(method, path string, h http.HandlerFunc)
	Group(prefix string) Router
}

type contextKey string

const urlParamsKey contextKey = "urlParams"

// WithURLParams stores path parameters in the context.
// Framework adapters must call this before invoking a handler.
func WithURLParams(ctx context.Context, params map[string]string) context.Context {
	return context.WithValue(ctx, urlParamsKey, params)
}

// URLParam retrieves a path parameter by name from the request context.
func URLParam(r *http.Request, key string) string {
	params, ok := r.Context().Value(urlParamsKey).(map[string]string)
	if !ok {
		return ""
	}
	return params[key]
}
