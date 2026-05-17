#!/usr/bin/env bash

## ---------- VARIABLES
LOG_LEVEL="DEBUG"



## ---------- UTILS
function logger() {
    DEFAULT_LOG_LEVEL="INFO"

    if [[ -z "${LOG_LEVEL}" ]]; then
        export LOG_LEVEL="${DEFAULT_LOG_LEVEL}"
    fi

    TIMESTAMP=$(date +'%Y/%m/%d %H:%M:%S')
    LEVEL=$1
    CLASS=$2
    MESSAGE=$3

    case "${LOG_LEVEL}" in
        "ERROR")
            echo -e "${TIMESTAMP} [${LEVEL}] [${CLASS}] - ${MESSAGE}" | grep -E "\[ERROR\]"
        ;;
        "WARN")
            echo -e "${TIMESTAMP} [${LEVEL}] [${CLASS}] - ${MESSAGE}" | grep -E "\[WARN\]"
        ;;
        "INFO")
            echo -e "${TIMESTAMP} [${LEVEL}] [${CLASS}] - ${MESSAGE}" | grep -E "\[INFO|WARN\]"
        ;;
        "DEBUG")
            echo -e "${TIMESTAMP} [${LEVEL}] [${CLASS}] - ${MESSAGE}"
        ;;
        *)
            echo -e "Invalid LOG_LEVEL: ${LOG_LEVEL}. Please choice one of these: ERROR, WARN, INFO, DEBUG"
            exit 1
        ;;
    esac
}

function check_api_health() {
  logger "DEBUG" "check_api_health" "Performing health check..."
  response=$(curl -sL -w "%{http_code}" -o /dev/null 'http://localhost:8080/api/v1/health/readiness')
  if [[ "${response}" -ne 200 ]]; then
    logger "ERROR" "check_api_health" "Health check failed with status code: ${response}"
    exit 1
  else
    logger "DEBUG" "check_api_health" "Health check passed with status code: ${response}"
  fi
}



## ---------- FUNCTIONS
function create_user() {
  logger "DEBUG" "create_user" "Creating user..."
  curl -sL -X 'POST' \
    'http://localhost:8080/api/v1/user' \
    -H 'accept: application/json' \
    -H 'Content-Type: application/json' \
    -d '{
    "biological_sex": "male",
    "birth_date": "1994-11-17",
    "email": "acardoso.ti@gmail.com",
    "name": "Augusto Cardoso dos Santos"
  }' | jq .
}
function get_user() {
  curl -sL -X 'GET' 'http://localhost:8080/api/v1/user' \
    -H 'accept: application/json' | jq -r ".[-1].id"
}

function create_assessment() {
  user_id=$1

  logger "DEBUG" "create_assessment" "Creating assessment..."
  curl -sL -X 'POST' \
    'http://localhost:8080/api/v1/assessment' \
    -H 'accept: application/json' \
    -H 'Content-Type: application/json' \
    -d '{
    "activity_level": "moderately_active",
    "body_fat": 31,
    "height": 160,
    "user_id": "'"${user_id}"'",
    "weight": 85.35
  }' | jq

  curl -sL -X 'POST' \
    'http://localhost:8080/api/v1/assessment' \
    -H 'accept: application/json' \
    -H 'Content-Type: application/json' \
    -d '{
    "activity_level": "moderately_active",
    "body_fat": 30.6,
    "height": 160,
    "user_id": "'"${user_id}"'",
    "weight": 84.35
  }' | jq
}
function get_assessment() {
  user_id=$1
  curl -sL -X 'GET' \
    "http://localhost:8080/api/v1/assessment?user_id=${user_id}" \
    -H 'accept: application/json' | jq
}

function create_project() {
  user_id=$1

  logger "DEBUG" "create_project" "Creating project..."
  curl -sL -X 'POST' \
    'http://localhost:8080/api/v1/project' \
    -H 'accept: application/json' \
    -H 'Content-Type: application/json' \
    -d '{
    "name": "Body Recomposition",
    "user_id": "'"${user_id}"'"
  }' | jq
}
function get_project() {
    user_id=$1
    curl -sL -X 'GET' \
    "http://localhost:8080/api/v1/project?user_id=${user_id}" \
    -H 'accept: application/json' | jq
}

function create_goal() {
  project_id=$1

  logger "DEBUG" "create_goal" "Creating goal..."
  curl -sL -X 'POST' \
    'http://localhost:8080/api/v1/goal' \
    -H 'accept: application/json' \
    -H 'Content-Type: application/json' \
    -d '{
    "name": "Be able to see my abs, obliques and serratus",
    "project_id": "'"${project_id}"'",
    "strategy_type": "recomposition"
  }' | jq
}

function get_goal() {
  project_id=$1
  curl -sL -X 'GET' \
    "http://localhost:8080/api/v1/goal?project_id=${project_id}" \
    -H 'accept: application/json' | jq
}

function create_protocol() {
  goal_id=$1

  logger "DEBUG" "create_protocol" "Creating protocol..."
  curl -sL -X 'POST' \
    'http://localhost:8080/api/v1/protocol' \
    -H 'accept: application/json' \
    -H 'Content-Type: application/json' \
    -d '{
    "goal_id": "'"${goal_id}"'",
    "name": "Body Recomposition"
  }' | jq
}
function get_protocol() {
  goal_id=$1
  curl -sL -X 'GET' \
    "http://localhost:8080/api/v1/protocol?goal_id=${goal_id}" \
    -H 'accept: application/json' | jq
}

function create_diet_plan() {
  protocol_id=$1

  logger "DEBUG" "create_diet_plan" "Creating diet plan..."
  curl -sL -X 'POST' \
    'http://localhost:8080/api/v1/diet-plan' \
    -H 'accept: application/json' \
    -H 'Content-Type: application/json' \
    -d '{
    "protocol_id": "'"${protocol_id}"'",
    "calorie_intensity": "moderate",
    "protein_intensity": "moderate",
    "fat_intensity": "moderate"
  }' | jq
}
function get_diet_plan() {
  protocol_id=$1
  curl -sL -X 'GET' \
    "http://localhost:8080/api/v1/diet-plan?protocol_id=${protocol_id}" \
    -H 'accept: application/json' | jq -r ".[-1].id"
}

function create_macro_estimation() {
  user_id=$1

  logger "DEBUG" "create_macro_estimation" "Creating macro estimation..."
  curl -sL -X 'POST' \
    'http://localhost:8080/api/v1/macro-estimation' \
    -H 'accept: application/json' \
    -H 'Content-Type: application/json' \
    -d '{
    "meal_description": "100g de arroz, 150g de sassami de frango.",
    "user_id": "'"${user_id}"'"
  }' | jq
}

function create_meal_log() {
  user_id=$1

  logger "DEBUG" "create_meal_log" "Creating meal log..."
  curl -sL -X 'POST' \
    'http://localhost:8080/api/v1/meal-log' \
    -H 'accept: application/json' \
    -H 'Content-Type: application/json' \
    -d '{
    "meal_description": "2 fatias de pão de forma, 1/2 colher de requeijão light, 2 fatias de peito de peru, 1 fatia de queijo prato, 250ml de café, 3 colheres de leite em pó.",
    "meal_title": "café",
    "user_id": "'"${user_id}"'"
  }' | jq

  curl -sL -X 'POST' \
    'http://localhost:8080/api/v1/meal-log' \
    -H 'accept: application/json' \
    -H 'Content-Type: application/json' \
    -d '{
    "meal_description": "100g de arroz, 150g de sassami de frango, 1.5 colher de requeijão light, 1/2 colher de ketchup, 1/4 colher de mostarda.",
    "meal_title": "almoço",
    "user_id": "'"${user_id}"'"
  }' | jq

  # curl -sL -X 'POST' \
  #   'http://localhost:8080/api/v1/meal-log' \
  #   -H 'accept: application/json' \
  #   -H 'Content-Type: application/json' \
  #   -d '{
  #   "meal_description": "200g de lombo suino feito na airfryer, 100g de arroz, 100g de feijão.",
  #   "meal_title": "janta",
  #   "user_id": "'"${user_id}"'"
  # }' | jq

  # curl -sL -X 'POST' \
  #   'http://localhost:8080/api/v1/meal-log' \
  #   -H 'accept: application/json' \
  #   -H 'Content-Type: application/json' \
  #   -d '{
  #   "meal_description": "24g de whey protein, 3 colheres de aveia em flocos finos, 1 maça picada, uma pitada de canela em pó.",
  #   "meal_title": "ceia",
  #   "user_id": "'"${user_id}"'"
  # }' | jq
}

function get_meal_log_history() {
  user_id=$1

  logger "DEBUG" "get_meal_log_history" "Getting meal log history..."
  curl -sL -X 'GET' \
    "http://localhost:8080/api/v1/meal-log/history?user_id=${user_id}" \
    -H 'accept: application/json' | jq
}

function get_diet_plan_adherence() {
  user_id=$1
  diet_plan_id=$2

  logger "DEBUG" "get_diet_plan_adherence" "Getting diet plan adherence..."
  curl -sL -X 'GET' \
    "http://localhost:8080/api/v1/diet-plan/adherence?user_id=${user_id}&diet_plan_id=${diet_plan_id}" \
    -H 'accept: application/json' | jq
}

function get_assessment_history() {
  user_id=$1

  logger "DEBUG" "get_assessment_history" "Getting assessment history..."
  curl -sL -X 'GET' \
    "http://localhost:8080/api/v1/assessment/history?user_id=${user_id}" \
    -H 'accept: application/json' | jq
}



## ---------- MAIN
## ----- 0. health check
check_api_health

## ----- 1. user
create_user
user_id=$(get_user)
if [[ -z "${user_id}" || "${user_id}" == "null" ]]; then
  logger "ERROR" "main" "Failed to get user_id"
  exit 1
fi

## ----- 2. assessment
create_assessment "${user_id}"

## ----- 3. project
create_project "${user_id}"
project_id=$(get_project "${user_id}" | jq -r ".[-1].id")
if [[ -z "${project_id}" || "${project_id}" == "null" ]]; then
  logger "ERROR" "main" "Failed to get project_id"
  exit 1
fi

## ----- 4. goal
create_goal "${project_id}"
goal_id=$(get_goal "${project_id}" | jq -r ".[-1].id")
if [[ -z "${goal_id}" || "${goal_id}" == "null" ]]; then
  logger "ERROR" "main" "Failed to get goal_id"
  exit 1
fi

## ----- 5. protocol
create_protocol "${goal_id}"
protocol_id=$(get_protocol "${goal_id}" | jq -r ".[-1].id")
if [[ -z "${protocol_id}" || "${protocol_id}" == "null" ]]; then
  logger "ERROR" "main" "Failed to get protocol_id"
  exit 1
fi

## ----- 6. diet_plan
create_diet_plan "${protocol_id}"
diet_plan_id=$(get_diet_plan "${protocol_id}")
if [[ -z "${diet_plan_id}" || "${diet_plan_id}" == "null" ]]; then
  logger "ERROR" "main" "Failed to get diet_plan_id"
  exit 1
fi

## ----- 7. macro_estimation
create_macro_estimation "${user_id}"

## ----- 8. meal_log
create_meal_log "${user_id}"

## ----- 9. log_meal_history
get_meal_log_history "${user_id}"

## ----- 10. diet_plan_adherence
get_diet_plan_adherence "${user_id}" "${diet_plan_id}"

## ----- 11. shape_evolution
get_assessment_history "${user_id}"
