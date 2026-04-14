package gin_adapter

import (
	"net/http"

	web "github.com/aleroxac/projetin/internal/infra/web"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

type GinRouter struct {
	engine *gin.Engine
	group  *gin.RouterGroup
}

func NewRouter() *GinRouter {
	gin.SetMode(gin.ReleaseMode)
	engine := gin.New()
	return &GinRouter{engine: engine, group: &engine.RouterGroup}
}

// Use registers Gin-specific middleware on the underlying engine.
func (r *GinRouter) Use(middlewares ...gin.HandlerFunc) {
	r.engine.Use(middlewares...)
}

// MountSwagger registers the Swagger UI at the given base path.
func (r *GinRouter) MountSwagger(basePath string) {
	r.engine.GET(basePath, func(c *gin.Context) {
		c.Redirect(http.StatusFound, basePath+"/index.html")
	})
	r.engine.GET(basePath+"/*any", func(c *gin.Context) {
		any := c.Param("any")
		if any == "/" || any == "" {
			c.Redirect(http.StatusFound, basePath+"/index.html")
			return
		}
		ginSwagger.WrapHandler(swaggerFiles.Handler)(c)
	})
}

// Handle implements web.Router. It bridges net/http handlers into Gin,
// injecting path parameters into the request context via web.WithURLParams.
func (r *GinRouter) Handle(method, path string, h http.HandlerFunc) {
	r.group.Handle(method, path, func(c *gin.Context) {
		params := make(map[string]string, len(c.Params))
		for _, p := range c.Params {
			params[p.Key] = p.Value
		}
		ctx := web.WithURLParams(c.Request.Context(), params)
		h(c.Writer, c.Request.WithContext(ctx))
	})
}

// Group implements web.Router.
func (r *GinRouter) Group(prefix string) web.Router {
	return &GinRouter{engine: r.engine, group: r.group.Group(prefix)}
}

// ServeHTTP implements http.Handler.
func (r *GinRouter) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	r.engine.ServeHTTP(w, req)
}
