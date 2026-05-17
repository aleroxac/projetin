# Process management: up/reload use `setsid` to start the app in a new session,
# placing make and npm under the same process group (PGID = PID).
# This allows `kill -- -PID` to terminate the entire tree at once.

PID_FILE := .pid
FRONTEND_PORT := 3000
READINESS_MAX_RETRIES := 15
READINESS_INTERVAL := 2

## ---------- UTILS
default: help

.PHONY: help
help: ## Show this menu
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_][a-zA-Z0-9._-]*:.*?## / {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: clean
clean: ## Clean temp files
	@rm -f $(PID_FILE) nohup.out

.PHONY: logs
logs: ## Tail the background server output
	@tail -f nohup.out


## ---------- MAIN
.PHONY: run
run: ## Run the frontend dev server
	@npm run dev

.PHONY: check.readiness
check.readiness: ## Wait until the frontend is READY
	@echo "Checking frontend readiness..."
	@retries=0; \
	until [ "$$(curl -s -o /dev/null -w '%{http_code}' http://localhost:$(FRONTEND_PORT)/api/v1/health/readiness)" = "200" ]; do \
		retries=$$((retries + 1)); \
		if [ $$retries -ge $(READINESS_MAX_RETRIES) ]; then \
			echo "  frontend not ready after $(READINESS_MAX_RETRIES) retries, aborting."; \
			exit 1; \
		fi; \
		echo "  not ready, retrying in $(READINESS_INTERVAL)s... ($$retries/$(READINESS_MAX_RETRIES))"; \
		sleep $(READINESS_INTERVAL); \
	done
	@echo "Frontend is READY."

.PHONY: up
up: ## Start the frontend in the background
	@echo "Starting Frontend..."
	@setsid $(MAKE) run > nohup.out 2>&1 & echo $$! > $(PID_FILE)
	@echo "Frontend started (PID: $$(cat $(PID_FILE)))"
	@$(MAKE) check.readiness

.PHONY: down
down: ## Stop the frontend
	@if [ -f $(PID_FILE) ]; then \
		echo "Stopping process group $$(cat $(PID_FILE))..."; \
		kill -- -$$(cat $(PID_FILE)) 2>/dev/null || true; \
		rm -f $(PID_FILE); \
	else \
		echo "No PID file found, app may not be running"; \
	fi

.PHONY: reload
reload: ## Restart the frontend
	@if [ -f $(PID_FILE) ]; then \
		echo "Stopping process group $$(cat $(PID_FILE))..."; \
		kill -- -$$(cat $(PID_FILE)) 2>/dev/null || true; \
		rm -f $(PID_FILE); \
	fi
	@setsid $(MAKE) run > nohup.out 2>&1 & echo $$! > $(PID_FILE)
	@echo "Frontend reloaded (PID: $$(cat $(PID_FILE)))"
	@$(MAKE) check.readiness
