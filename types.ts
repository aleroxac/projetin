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
    delegatedUsers: string[]; 
  }
  
  export interface Profile {
    id: string;
    userId: string;
    name: string; 
    roles: UserRole[];
    sports: Sport[];
    birthDate: string;
    gender: 'M' | 'F';
    heightCm: number;
    weightKg: number;
    activityLevel: number; 
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
      tmb: number; 
      tdee: number; 
      targetCalories: number;
      targetProtein: number;
      targetCarbs: number;
      targetFat: number;
      weeklyWeightGoal: number; 
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

  export interface FoodDefinition {
    name: string;
    caloriesPerGram: number;
    proteinPerGram: number;
    carbsPerGram: number;
    fatPerGram: number;
    lastQuantityStr: string;
  }

  export interface MealCacheEntry {
    name: string;
    items: FoodItem[];
    macros: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    insight: string;
    tier?: 'S' | 'A' | 'B' | 'C' | 'D';
    swaps?: string[];
  }
  
  export interface Meal {
    id: string;
    protocolId: string;
    timestamp: string;
    description: string; 
    name: string; 
    mood: 'HAPPY' | 'NEUTRAL' | 'SAD' | 'STRESSED' | 'HUNGRY';
    shapePerception: number; 
    items: FoodItem[]; 
    macros: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    aiInsight?: string;
    tier?: 'S' | 'A' | 'B' | 'C' | 'D';
    swaps?: string[];
    imageUrl?: string;
  }
  
  export interface ExerciseSet {
    reps: number;
    weight: number;
    rpe: number; 
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
    name: string; 
    description?: string;
    targetMuscleGroups: string[];
    exercises: Exercise[]; 
  }
  
  export interface Workout {
    id: string;
    protocolId: string;
    planId?: string; 
    timestamp: string;
    name: string;
    exercises: Exercise[];
    notes?: string;
  }