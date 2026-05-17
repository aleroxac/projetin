PID_BACK := .back.pid
PID_FRONT := .front.pid

## ---------- UTILS
default: help

.PHONY: help
help: ## Show this menu
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_][a-zA-Z0-9._-]*:.*?## / {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)


## ---------- MAIN
.PHONY: backend.up
backend.up: ## Start the backend
	@$(MAKE) -C backend up

.PHONY: backend.down
backend.down: ## Stop the backend
	@$(MAKE) -C backend down

.PHONY: backend.reload
backend.reload: ## Restart the backend
	@$(MAKE) -C backend reload

.PHONY: frontend.up
frontend.up: ## Start the frontend
	@$(MAKE) -C frontend up

.PHONY: frontend.down
frontend.down: ## Stop the frontend
	@$(MAKE) -C frontend down

.PHONY: frontend.reload
frontend.reload: ## Restart the frontend
	@$(MAKE) -C frontend reload

.PHONY: up
up: backend.up frontend.up ## Start backend and frontend

.PHONY: down
down: backend.down frontend.down ## Stop backend and frontend

.PHONY: reload
reload: backend.reload frontend.reload ## Restart backend and frontend

