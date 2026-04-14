# projetin

> “Chama no projetin, pai — now powered by Artificial Intelligence.”

### Meaning

**CODENAME: PROJETIN_PAI**

**P**ersonal **R**outine **O**ptimizer with **J**ust **E**nough **T**raining and **I**ntelligent **N**utrition — 
**P**owered by **A**rtificial **I**ntelligence.

A command-line tool built in **Golang** to help you track your **diet**, **training**, and **focus**,  
using smart routines and meme-fueled motivation.

---

## Table of Content
- [Purpose](#purpose)
    - [Problem](#problem)
    - [Solution](#solution)
- [Product](#product)
    - [Brief](#brief)
    - [Modules](#modules)
    - [Architecture](#architecture)
    - [Tech Stack](#tech-stack)
    - [MVP](#mvp)
    - [FVP](#fvp)

---

## Purpose

### Problem
Depois de já ter definido minhas metas de macros e calorias diárias, hoje eu uso o Gemini diariamente para postar minhas refeições, ver as macros e calorias e então fazer os ajustes necessários para que eu bata todas as metas. O problema dessa abordagem é que eu faço a mesma coisa todos os dias, manualmente, e diversas vezes preciso fazer multiplas interações a fim de conseguir sugestões de alterações de itens e/ou quantidades nas minhas refs, sugestões de refs, etc.

### Solution
Como já faço isso há mais de 2 meses, notei alguns padrões. Acho que todas, ou pelo menos boa parte, dessas interações podem ser automatizadas e gerenciadoas através de um app com AI integrada.

---

## Product

### Brief
Um WebApp com features que juntas sejam capazes de entregar a mesma experiência que já tenho usando o Gemini, mas com uma interface mais amigável e 100% customizada para meu caso de uso.

### Modules
1. **Profile**: Manages user identity, biological baseline data (such as age and biological sex for BMR calculations), and global application preferences like measurement units, language, and notification triggers.
2. **Assessment**: Acts as the "Single Source of Truth" for the user's physical and behavioral state, encompassing clinical anamnesis, lifestyle habits, anthropometry, and detailed bioimpedance metrics (e.g., phase angle and fluid balance).
3. **Project**: Defines the overarching strategy by linking specific goals (Cut, Bulk, Recomposition) to structured protocols, including precise nutritional targets, workout splits, and a phased roadmap for long-term execution.
4. **Fitness**: The operational core for daily execution, featuring real-time meal and training logs, an intelligent suggestion engine that cross-references food inventory with nutritional plans, and an equipment/food inventory manager.
5. **Journey**: Handles temporal logistics and behavioral tracking through a specialized agenda (exams, surgeries, competitions), gamified achievement milestones, and holistic trackers for sleep, mood, and stress levels.
6. **Analytics**: A command center for data intelligence that correlates physiological feedback (e.g., satiety and excretory health) with physical performance trends and visual evolution via a dedicated "Pose Room" gallery.

### Architecture
The project follows a Clean Architecture (Hexagonal) approach, ensuring that the core business logic (Diet/Workout rules) remains decoupled from external frameworks and AI providers.

- **Communication**: RESTful API design using Gin-Gonic, documented with Swaggo for clear endpoint definitions and easy frontend integration.
- **Data Layer**:
    - Persistence: PostgreSQL handles relational data such as User Profiles, Assessments, and Project Roadmaps.
    - Mapping: Uses sqlc for type-safe SQL generation in Go, ensuring high performance and compile-time safety.
    - Caching: A dual-layer strategy with Redis for server-side session/macro calculations and IndexedDB on the frontend for offline-first logging capabilities.
- **AI Orchestration Layer**: A specialized service that abstracts multiple LLM providers (Gemini, OpenAI, Anthropic). It handles:
    - Natural Language Processing: Converting raw text (e.g., "300g of rice and 200g of steak") into structured JSON macros.
    - Intelligent Suggestions: Cross-referencing food_inventory with diet_plan to provide real-time meal adjustments.
    - OCR/Scraping: Processing images or data from external sources (i.e., Growth, Swift) to populate the nutritional database.
- **DevOps & DX**:
    - Hot Reload: Development powered by Air for a seamless Go coding experience.
    - Migrations: Managed by golang-migrate to ensure consistent schema evolution across environments.
    - Deployment: Optimized for a PWA (Progressive Web App) experience on the frontend, allowing for mobile-like usage without store overhead.

### Tech Stack
- frontend: SPA/PWA - typescript + nextjs + tailwindcss + shadcn
- backend: golang + gin-gonic + sqlc + swaggo + air + golang-migrate
- storage: postgresql
- cache: backend[permanent(postgresql) + in-memory(redis)] + frontend[indexed-db]
- auth: backend[JWT] + frontend[social-login]
- integrations: ai-providers(anthropic,openai,gemini,ollama,llamacpp) + public-apis(USDA's Food and Nutrition Service, TACO(Tabela Brasileira de Composição de Alimentos) + ocr/scrap(ifood,demarchi,growth,swift))

### MVP - Minimum Viable Product
``` yaml
mvp:
    user:
        - profile: [name, email, biological_sex, birth_date] # For BMR calculations
    assessment:
        - quick_stats: [weight, height, body_fat, activity_level] # Immediate data for macro targeting
        - bmi, bmr, tdee
    project:
        - name
        - goal: [body_recomposition] # Fixed goal for MVP
    protocol:
        - name
    diet_plan:
        - name
        - targets # Hardcoded targets
            - water: l
            - calories: 1850 kcal
            - protein: 150g
            - carbohydrate: 165g
            - fat: 71g
    fitness:
        - macro_estimation
        - meal_log
    analytics:
        - meal_history
        - diet_plan_adherence_table: "Meals vs. Consumed vs. Goal vs. Remaining"
        - weight_and_bf_trend
```

### FVP - Fully Viable Product
``` yaml
user:
    profile: 
        - name
        - email
        - photo
        - birth_date
        - biological_sex # Biological Sex vs Gender: Para cálculos de Bioimpedância e Taxa Metabólica Basal (TMB), as fórmulas (Harris-Benedict, Mifflin-St Jeor, Katch-McArdle) exigem o sexo biológico devido à densidade óssea e distribuição hormonal.
    preferences:
        - theme: [light, dark, system]
        - language: [en, pt_br, es]
        - measurement_units:
            weight: [kg, lb]
            height: [cm, ft_in]
            fluids: [ml, oz]
            distance: [km, mi]
        - notifications: 
            meal_reminders: boolean
            workout_reminders: boolean
            water_intake_reminders: boolean

assessment:
    anamnesis:
        clinical_history: [chronic_illnesses, past_surgeries, family_history]
        physical_limitations: [joint_injuries, mobility_restrictions]
        biochemical_markers: [blood_glucose, cholesterol_ldl_hdl, iron_levels] # Opcional: para usuários avançados/atletas
        medications_and_allergies: [active_medications, drug_allergies]
    lifestyle_and_habits:
        dietary_profile:
            preferences: [vegan, vegetarian, omnivore, paleo]
            restrictions: [lactose_intolerance, gluten_sensitivity, nut_allergy]
            forbidden_foods: [specific_dislikes]
        eating_patterns:
            meal_frequency: [meals_per_day]
            schedule: [wakeup_time, sleep_time, training_window]
            logistics: [cooks_at_home, eats_out, uses_meal_prep]
        activity_baseline:
            activity_level: [sedentary, lightly_active, moderately_active, very_active, extra_active]
            sports_practiced: [bodybuilding, running, swimming, cycling, fighting]
            occupational_activity: [sedentary_desk_job, active_manual_labor]
            sleep_hygiene: [average_hours, sleep_quality_score]
            hydration_baseline: [current_daily_water_intake]
    body_composition:
        - height
        - weight

        body_metrics:
            anthropometry:
                - circumferences
            adipometry:
                - skinfold_measurements
        bioimpedance:
            core_composition:
                description: "Essential metrics for tracking body tissue distribution."
                fields:
                    - body_weight
                    - body_fat_percentage
                    - skeletal_muscle_mass
                    - lean_body_mass
                    - fat_mass
            fluid_hydration_balance:
                description: "Data regarding water distribution and cellular health."
                fields:
                    - total_body_water
                    - intracellular_water
                    - extracellular_water
                    - ecw_ratio  # (Extracellular Water / Total Body Water) - critical for recovery/inflammation tracking
            metabolic_health_risks:
                description: "Indicators of metabolic efficiency and long-term health risks."
                fields:
                    - visceral_fat_level
                    - basal_metabolic_rate
                    - metabolic_age
                    - phase_angle # Key indicator of cellular integrity and nutritional status for athletes
            tissue_mineral_analysis:
                description: "Assessment of structural components and protein levels."
                fields:
                    - bone_mineral_content
                    - protein_mass
                    - body_cell_mass
            indices_and_classifications:
                description: "Calculated markers used for clinical or aesthetic categorization."
                fields:
                    - bmi  # Body Mass Index
                    - obesity_degree
                    - body_type_category

project:
    goal:
        - strategy_type: [cut, bulk, maintenance, recomposition]
        - target_metrics: 
            - weight: float
            - body_fat: float
            - date: date
    protocol:
        diet_plan:
            nutritional_targets:
                calories: int
                salt: g
                fibers: g
                water: l
                macronutrients: { 
                    protein: g, 
                    carbohydrate: g, 
                    fat: g 
                }
                micronutrients: { 
                    vitamin-b6: mg, 
                    vitamin-d: mg, 
                    vitamin-c: mg, 
                    vitamin-b12: mg, 
                    sodium: mg, 
                    zinc: mg, 
                    magnezium: mg, 
                    iron: mg, 
                    calcium: mg, 
                    potassium: mg, 
                    omega3: mg, 
                    fosfato: mg, 
                    iodo: mg 
                }
            meal_structure:
                daily_meals: # List of objects (name, time, fixed_macros)
                flexible_meal_allowance: # Calories/Macros reserved for flexible eating
                cheat_meal_policy: # Frequency (e.g., weekly) or Calorie surplus limit
            supplementation_stack:
                - product_name
                - dosage
                - timing: [pre_workout, post_workout, morning, etc]
            pharmacology_log: # Crucial for advanced athletes/monitoring
                - substance_name
                - dosage
                - frequency
                - cycle_duration
        workout_plan:
            structure: 
                split_type: [push_pull_legs, upper_lower, full_body, abcdef]
                training_frequency: int # days per week
                days_off_schedule: list
            execution:
                exercises: # List of objects (name, sets, reps, rest_period, RPE)
                cardio_sessions: # Type, duration, intensity (LISS, HIIT)
    roadmap:
        - stages: # Long-term phases (e.g., "Intro", "Peak", "Deload")
            - name
            - duration_weeks
        - steps: # Granular milestones or weekly adjustments
            - sequence_number
            - objective_checkpoint
            - adjustments_made: text

fitness:
    diet_management:
        logging:
            - meal
            - water
            - medicines
            - supplements
        culinary_database:
            recipes:
                - name
                - macros_per_serving
                - preparation_time
                - ingredients_list
            food_inventory:
                - item_name
                - category: [protein, carb, fat, vegetable, seasoning]
                - quantity_available: float (g, kg, units)
                - status: [in_stock, low_stock, expired]
                - purchase_frequency: [weekly, monthly]
        intelligent_engine:
            estimation_estimation: # Calculating macros for custom/external meals
            meal_suggestions: 
                criteria: [palatability_score, nutritional_density]
                constraints: [inventory_match, current_goal_alignment, diet_plan_rules]
                context: [food_inventory, diet_plan, assessment[anamnesis, lifestyle_and_habits]]
    workout_execution:
        training_log:
            session_data: [date, duration, overall_rpe]
            set_performance: [exercise_id, weight, reps, sets, rest_time]

        knowledge_base:
            exercise_guides: [video_link, execution_notes, common_mistakes]
            muscle_group_mapping: # Relationship between exercises and target muscles
        
        physical_assets:
            equipment_inventory: [dumbbells, barbell, bench, resistance_bands]
            location: [home_gym, commercial_gym, park]

        performance_tracking:
            strength_benchmarks: [one_rep_max, volume_pr]
            endurance_benchmarks: [resting_heart_rate, vo2_max_est, pace_thresholds]

journey:
    agenda:
        description: "Temporal logistics for health and performance events."
        events:
            - championships: [date, category, location, placement_result]
            - assessments: [physical_evaluations, bioimpedance_sessions]
            - medical_appointments: [specialty, doctor_name, follow_up_date]
            - clinical_exams: [blood_work, imaging, stress_tests]
            - surgical_history: [procedure_type, recovery_status, medical_clearance]
            - generic_events: [seminars, workshops, fitness_fairs]
    gamification_and_achievements:
        description: "Milestones achieved across different performance pillars."
        milestones:
            - diet_milestones: [streak_days, macro_precision_awards]
            - workout_milestones: [personal_records, volume_targets, consistency_badges]
            - shape_evolution: [body_fat_drops, muscle_mass_gains, visual_transformations]
            - health_markers: [improved_cholesterol, resting_heart_rate_drops]
            - external_awards: [medals, certificates, podiums]
    lifestyle_trackers:
        description: "Subjective and objective metrics for holistic monitoring."
        performance_adherence:
            - goal_adherence_index: float # % of project roadmap completed
            - diet_adherence_rate: float # % of daily meals on-plan
            - workout_consistency: float # % of planned sessions executed
        well_being_metrics:
            - mood_log: [rating, dominant_emotion]
            - stress_level: [low, moderate, high, recovery_needed]
            - sleep_tracker: [total_hours, deep_sleep_percentage, quality_score]

analytics:
  shape_analytics:
    description: "Visual and physical evolution tracking."
    metrics:
      - weight_trend: [current, average_weekly, rate_of_change]
      - body_composition_evolution: [fat_mass_change, lean_mass_gain]
      - anthropometric_history: [circumference_growth_heatmaps]
    visual_progress:
      - pose_room_gallery: [front, back, side, vacuum, legs]
      - shape_transformation_roadmap: [side_by_side_comparisons, milestone_overlay]

  physiological_well_being:
    description: "Bio-feedback markers for metabolic and mental health."
    subjective_performance:
      - satiety_levels: [hunger_peaks_analysis, post_meal_fullness]
      - mental_state: [focus_score, mood_fluctuation]
      - sleep_efficiency: [quality_vs_recovery_correlation]
    excretory_health:
      - bowel_movement_log: [frequency, consistency_bristol_scale]
      - urinary_profile: [hydration_color_chart, daily_frequency]

  fitness_performance_analytics:
    dietary_adherence:
      - meal_consistency_score: percentage
      - supplementation_compliance: percentage
      - pharmacology_cycle_tracking: [dosage_adherence, duration_left]
      - hydration_efficiency: [water_intake_vs_target]

    workout_science:
        physical_capacities: # The 8 pillars of fitness
            - strength_plateaus: [1RM_tracking]
            - endurance_capacity: [stamina_levels]
            - speed_and_power: [sprint_times, explosive_movements]
            - agility_flexibility_coordination: [mobility_scores]
            - equilibrium_stability: [balance_metrics]
        session_intelligence:
            - training_volume_load: [tonnage_per_muscle_group]
            - metabolic_impact: [calories_burned_estimation]
            - rpe_analysis: [rate_of_perceived_exertion_trends]
            - time_efficiency: [total_duration_active_vs_rest]
```

---
