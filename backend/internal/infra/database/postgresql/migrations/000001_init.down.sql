DROP VIEW IF EXISTS user_daily_performance;
DROP VIEW IF EXISTS daily_macro_summary;

DROP INDEX IF EXISTS idx_unique_active_diet_per_protocol;
DROP INDEX IF EXISTS idx_unique_protocol_per_goal;
DROP INDEX IF EXISTS idx_unique_goal_per_project;
DROP INDEX IF EXISTS idx_unique_project_per_user;

DROP TABLE IF EXISTS meal_logs;
DROP TABLE IF EXISTS macro_estimations;
DROP TABLE IF EXISTS diet_plans;
DROP TABLE IF EXISTS protocols;
DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS assessments;
DROP TABLE IF EXISTS users;

DROP EXTENSION IF EXISTS "pgcrypto";
