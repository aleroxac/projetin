export enum UserRole {
    ATHLETE = 'Atleta',
    COACH = 'Treinador',
    NUTRITIONIST = 'Nutricionista',
    PHYSIOTHERAPIST = 'Fisioterapeuta',
    DOCTOR = 'Médico/Nutrólogo',
    SPONSOR = 'Patrocinador'
  }
  
  export enum Sport {
    BODYBUILDING = 'Fisiculturismo',
    CROSSFIT = 'Crossfit',
    RUNNING = 'Corrida',
    SWIMMING = 'Natação',
    CYCLING = 'Ciclismo',
    POWERLIFTING = 'Powerlifting',
    CALISTHENICS = 'Calistenia'
  }
  
  export interface User {
    id: string;
    name: string;
    email: string;
    bio?: string;
    avatarUrl?: string;
    delegatedUsers: string[]; // IDs of users who can access this account
  }
  
  export interface Profile {
    id: string;
    userId: string;
    name: string; // e.g., "Season 2024 - Bodybuilding"
    roles: UserRole[];
    sports: Sport[];
    birthDate: string;
    gender: 'M' | 'F';
    heightCm: number;
    weightKg: number;
    activityLevel: number; // 1.2 to 2.5 multiplier
    bodyStats: {
      chest?: number;
      arms?: number;
      legs?: number;
      waist?: number;
      hips?: number;
      neck?: number;
      bodyFat?: number;
    };
  }
  
  export interface Protocol {
    id: string;
    profileId: string;
    name: string;
    goal: 'LOSE' | 'GAIN' | 'MAINTAIN';
    startDate: string;
    endDate: string;
    stats: {
      tmb: number; // Basal Metabolic Rate
      tdee: number; // Total Daily Energy Expenditure
      targetCalories: number;
      targetProtein: number;
      targetCarbs: number;
      targetFat: number;
      weeklyWeightGoal: number; // kg
    };
    freeMealsPerWeek: number;
    supplements: Supplement[];
    events: CalendarEvent[];
  }
  
  export interface Supplement {
    id: string;
    name: string;
    dosage: string;
    timing: string;
    description?: string;
  }
  
  export interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    type: 'CONSULTATION' | 'SURGERY' | 'EXAM' | 'COMPETITION' | 'CHECKIN';
    description?: string;
  }

  export interface FoodItem {
    name: string;
    quantity?: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }
  
  export interface Meal {
    id: string;
    protocolId: string;
    timestamp: string;
    description: string; // The raw input
    name: string; // "Lunch", "Dinner" etc
    mood: 'HAPPY' | 'NEUTRAL' | 'SAD' | 'STRESSED' | 'HUNGRY';
    shapePerception: number; // 1-10
    items: FoodItem[]; // Individual items
    macros: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    aiInsight?: string;
    imageUrl?: string;
  }
  
  export interface ExerciseSet {
    reps: number;
    weight: number;
    rpe: number; // Rate of Perceived Exertion (1-10)
    type: 'WARMUP' | 'FEEDER' | 'WORKING';
  }
  
  export interface Exercise {
    name: string;
    muscleGroup: string;
    equipment?: string;
    sets: ExerciseSet[];
    restSeconds: number;
    notes?: string;
  }

  export interface WorkoutPlan {
    id: string;
    protocolId: string;
    name: string; // e.g. "Leg Day A"
    description?: string;
    targetMuscleGroups: string[];
    exercises: Exercise[]; // Template exercises
  }
  
  export interface Workout {
    id: string;
    protocolId: string;
    planId?: string; // Linked to a plan
    timestamp: string;
    name: string;
    exercises: Exercise[];
    notes?: string;
  }