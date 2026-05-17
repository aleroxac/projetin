BASE_DIR := $(PWD)/backend
# cd $(BASE_DIR)

conf ?= .env
include $(conf)
export $(shell sed 's/=.*//' $(conf))

## Remove quotes from env variables loaded from .env file
$(foreach var, $(shell sed 's/=.*//' $(conf)), \
	$(eval $(var) := $(subst ",,$($(var)))) \
	$(eval $(var) := $(subst ',,$($(var)))) \
)


## ---------- UTILS
default: help

.PHONY: help
help: ## Show this menu
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_][a-zA-Z0-9._-]*:.*?## / {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: clean
clean: ## Clean all temp files
	@sudo rm -f coverage.* .run .build



## ---------- FUNCTIONS
## setup workspace
define setup
	for folder in .run .build; do \
		[ -d $1 ] && mkdir $1 || true; \
		cp main.go .build; \
	done
endef

## teardown workspace
define teardown
	for folder in .run .build; do \
		[ -d $1 ] && rm -rf $1 || true; \
	done
endef



## ---------- SETUP
.PHONY: install.reqs
install.reqs: ## install app requirements
	@go mod tidy

.PHONY: install.air
install.air: ## install air
	@if [ ! -f ~/.go/bin/air ]; then \
		go install github.com/air-verse/air@latest; \
	else \
		echo "Great, you already have [air] installed"; \
	fi

.PHONY: install.swag
install.swag: ## install swag
	@if [ ! -f ~/.go/bin/swag ]; then \
		go install github.com/swaggo/swag/cmd/swag@latest; \
	else \
		echo "Great, you already have [swag] installed"; \
	fi

.PHONY: install.migrate
install.migrate: ## install migrate
	@if [ ! -f /usr/local/bin/migrate ]; then \
		wget -O /tmp/migrate.tar.gz https://github.com/golang-migrate/migrate/releases/download/v4.19.1/migrate.linux-amd64.tar.gz; \
		tar -C /tmp -xzvf /tmp/migrate.tar.gz; \
		sudo mv /tmp/migrate /usr/local/bin/migrate; \
	else \
		echo "Great, you already have [migrate] installed"; \
	fi

.PHONY: install.sqlc
install.sqlc: ## install sqlc
	@if [ ! -f ~/.go/bin/sqlc ]; then \
		go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest; \
	else \
		echo "Great, you already have [sqlc] installed"; \
	fi

.PHONY: install
install: install.reqs install.air install.swag install.migrate install.sqlc ## install all requirements



## ---------- MIGRATIONS
.PHONY: migration.init
migration.init: ## init migrations
	@migrate create -ext=sql -dir=internal/infra/database/postgresql/migrations -seq init

.PHONY: migration.up
migration.up: ## run migrations up
	@migrate -path=internal/infra/database/postgresql/migrations -database "postgres://$(DB_USER):$(DB_PASSWORD)@127.0.0.1:$(DB_PORT)/$(DB_NAME)?sslmode=disable" -verbose up
	@docker exec -it postgresql psql -U $(DB_USER) -d $(DB_NAME) -c "\dt"

.PHONY: migration.down
migration.down: ## run migrations down
	@migrate -path=internal/infra/database/postgresql/migrations -database "postgres://$(DB_USER):$(DB_PASSWORD)@127.0.0.1:$(DB_PORT)/$(DB_NAME)?sslmode=disable" -verbose down --all
	@docker exec -it postgresql psql -U $(DB_USER) -d $(DB_NAME) -c "\dt"

.PHONY: migration.clean
migration.clean: migration.down migration.up ## run migration down and up to cleanup all data



## ---------- FORMAT & LINT
.PHONY: fmt
fmt: ## format the code
	@go fmt ./...

.PHONY: vet
vet: ## run static analysis
	@go vet ./...



## ---------- TESTS
.PHONY: test
test: ## run unit-tests
	@go test -v -run ^Test ./... -coverprofile coverage.out
	@go tool cover -html=coverage.out -o coverage.html

.PHONY: bench
bench: ## run benchmarks
	@go test -v -benchmem -run ^Benchmark ./...



## ---------- MAIN
.PHONY: build
build: ## Build the code
	@$(call setup, .build)
	@go build -o main ./...
	@$(call teardown, .build)

.PHONY: buildc
buildc: ## Build the container image
	@docker buildx build --platform linux/amd64,linux/arm64 --build-arg ENV=local -t aleroxac/projetin:local -f Dockerfile .

.PHONY: docs
docs: ## generate docs
	@swag init -g cmd/api/main.go
	@go mod tidy

.PHONY: sqlc.gen
sqlc.gen: ## generate sqlc code
	@sqlc generate

.PHONY: air
air: ## run the app locally, with live-reaload by air
	@air -c air.yaml

.PHONY: run
run: docs sqlc.gen ## run the app
	@go run ./...

.PHONY: runc
runc: docs sqlc.gen ## run the app via docker
	@docker run -d --name=myapp -p 8080:8080 --env-file=${PWD}/.env aleroxac/myapp:v1

.PHONY: compose.up
compose.up: ## run docker-compose up
	@docker compose up -d --wait

.PHONY: compose.down
compose.down: ## run docker-compose down
	@docker compose down
