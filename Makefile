PID_BACK := .back.pid
PID_FRONT := .front.pid

## ---------- UTILS
default: help

.PHONY: help
help: ## Show this menu
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_][a-zA-Z0-9._-]*:.*?## / {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)


## ---------- MAIN
.PHONY: run.back
run.back: ## Run the backend
	@echo "Starting Backend..."
	@$(MAKE) -C backend docs
	@$(MAKE) -C backend sqlc.gen
	@$(MAKE) -C backend compose.up
	@$(MAKE) -C backend migration.up
	@$(MAKE) -j 2 -C backend run

.PHONY: run.front
run.front: ## Run the frontend
	@echo "Starting Frontend..."
	@$(MAKE) -j 2 -C frontend run

.PHONY: run
run: ## Run both, backend and frontend
	@$(MAKE) -j 2 run.back run.front

.PHONY: app.up
app.up: ## Run run back and front in BG and save PID's
	@$(MAKE) run.back > backend.log 2>&1 & echo $$! > $(PID_BACK)
	@$(MAKE) run.front > frontend.log 2>&1 & echo $$! > $(PID_FRONT)
	@echo "Logs available: backend.log e frontend.log"

.PHONY: app.down
app.down: ## Kill front and back processes by PID and turn off the infra
	@if [ -f $(PID_FRONT) ]; then kill $$(cat $(PID_FRONT)) && rm $(PID_FRONT); fi
	@if [ -f $(PID_BACK) ]; then kill $$(cat $(PID_BACK)) && rm $(PID_BACK); fi
	@$(MAKE) -C backend compose.down
