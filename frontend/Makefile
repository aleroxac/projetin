# Process management: up/reload use `setsid` to start the app in a new session,
# placing make and npm under the same process group (PGID = PID).
# This allows `kill -- -PID` to terminate the entire tree at once.

PID_FILE := .pid

## ---------- UTILS
default: help

.PHONY: help
help: ## Show this menu
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_][a-zA-Z0-9._-]*:.*?## / {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: clean
clean: ## Clean temp files
	@rm -f $(PID_FILE) nohup.out


## ---------- MAIN
.PHONY: run
run: ## Run the frontend dev server
	@npm run dev

.PHONY: up
up: ## Start the frontend in the background
	@echo "Starting Frontend..."
	@setsid $(MAKE) run > nohup.out 2>&1 & echo $$! > $(PID_FILE)
	@echo "Frontend started (PID: $$(cat $(PID_FILE)))"

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
