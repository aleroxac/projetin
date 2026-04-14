-- Enable UUID extension if not present (Required for PostgreSQL < 13)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    biological_sex VARCHAR(20) NOT NULL, -- 'male' or 'female' for BMR formulas
    birth_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- 2. Assessments Table (Dynamic Biometrics)
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weight DECIMAL(5,2) NOT NULL,         -- Required for BMI/BMR
    height DECIMAL(5,2) NOT NULL,         -- Required for BMI/BMR
    body_fat DECIMAL(4,1),                -- For Katch-McArdle formula
    activity_level VARCHAR(50) NOT NULL,  -- 'sedentary', 'lightly_active', etc.
    bmi DECIMAL(7,2),
    bmr DECIMAL(7,2),
    tdee DECIMAL(7,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- 4. Goals Table
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    strategy_type VARCHAR(50) NOT NULL, -- 'recomposition', 'cut', 'bulk', 'maintain'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- 5. Protocols Table
CREATE TABLE IF NOT EXISTS protocols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- 6. DietPlans Table
CREATE TABLE IF NOT EXISTS diet_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_id UUID NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
    calorie_intensity VARCHAR(20) NOT NULL DEFAULT 'moderate', -- 'mild', 'moderate', 'strict', 'extreme'
    protein_intensity VARCHAR(20) NOT NULL DEFAULT 'moderate',
    fat_intensity    VARCHAR(20) NOT NULL DEFAULT 'moderate',
    protein  DECIMAL(6,2) NOT NULL DEFAULT 150.00,
    carbs    DECIMAL(6,2) NOT NULL DEFAULT 165.00,
    fat      DECIMAL(6,2) NOT NULL DEFAULT 71.00,
    calories DECIMAL(6,2) NOT NULL DEFAULT 1850.00,
    water    DECIMAL(6,2) NOT NULL DEFAULT 3500.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- 7. MacroEstimations Table
CREATE TABLE IF NOT EXISTS macro_estimations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meal_description TEXT NOT NULL DEFAULT '',
    meal_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- 8. MealLogs Table
CREATE TABLE IF NOT EXISTS meal_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meal_title VARCHAR(255) NOT NULL,
    meal_description TEXT NOT NULL DEFAULT '',
    meal_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Uniqueness Constraints
CREATE UNIQUE INDEX idx_unique_project_per_user    ON projects(user_id, name)       WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_unique_goal_per_project    ON goals(project_id, name)       WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_unique_protocol_per_goal   ON protocols(goal_id, name)      WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_unique_active_diet_per_protocol ON diet_plans(protocol_id)  WHERE is_active = TRUE AND deleted_at IS NULL;

-- VIEW: Aggregated Daily Consumption
CREATE OR REPLACE VIEW daily_macro_summary AS
SELECT
    ml.user_id,
    DATE(ml.created_at) AS log_date,
    ROUND(SUM((item->>'protein')::numeric), 2)  AS total_protein,
    ROUND(SUM((item->>'carbs')::numeric), 2)    AS total_carbs,
    ROUND(SUM((item->>'fat')::numeric), 2)      AS total_fat,
    ROUND(SUM((item->>'calories')::numeric), 2) AS total_calories
FROM meal_logs ml
CROSS JOIN LATERAL jsonb_array_elements(ml.meal_items) AS item
WHERE ml.deleted_at IS NULL
GROUP BY ml.user_id, DATE(ml.created_at);

-- VIEW: Performance Analytics (Consolidated Dashboard)
CREATE OR REPLACE VIEW user_daily_performance AS
SELECT
    u.id AS user_id,
    u.name AS user_name,
    DATE(ml.created_at) AS log_date,
    ROUND(SUM((item->>'protein')::numeric), 2)  AS consumed_protein,
    dp.protein,
    ROUND(SUM((item->>'calories')::numeric), 2) AS consumed_calories,
    dp.calories,
    dp.water,
    -- Simple adherence calculation for SRE dashboarding
    CASE
        WHEN dp.calories > 0 THEN ROUND((SUM((item->>'calories')::numeric) / dp.calories) * 100, 2)
        ELSE 0
    END AS calories_adherence_pct
FROM users u
JOIN meal_logs ml ON u.id = ml.user_id AND ml.deleted_at IS NULL
CROSS JOIN LATERAL jsonb_array_elements(ml.meal_items) AS item
JOIN projects p  ON u.id  = p.user_id    AND p.is_active  = TRUE AND p.deleted_at  IS NULL
JOIN goals g     ON p.id  = g.project_id AND g.is_active  = TRUE AND g.deleted_at  IS NULL
JOIN protocols pr ON g.id = pr.goal_id   AND pr.is_active = TRUE AND pr.deleted_at IS NULL
JOIN diet_plans dp ON pr.id = dp.protocol_id AND dp.is_active = TRUE AND dp.deleted_at IS NULL
WHERE ml.created_at >= CURRENT_DATE
GROUP BY u.id, u.name, DATE(ml.created_at), dp.protein, dp.calories, dp.water;
