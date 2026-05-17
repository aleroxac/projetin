// Base URL do backend (usado apenas no server-side).
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

export interface Project {
  id: string;
  name: string;
  isActive: boolean;
  userID: string;
}

export interface Goal {
  id: string;
  name: string;
  isActive: boolean;
  projectID: string;
  strategyType: string;
}

export interface Protocol {
  id: string;
  name: string;
  isActive: boolean;
  goalID: string;
}

export interface DietPlan {
  id: string;
  protocolId: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  isActive: boolean;
  calorieIntensity: string;
  proteinIntensity: string;
  fatIntensity: string;
}

export interface MacroAdherence {
  consumed: number;
  target: number;
  adherence: number;
}

export interface DietPlanAdherence {
  dietPlanId: string;
  date: string;
  calories: MacroAdherence;
  protein: MacroAdherence;
  carbs: MacroAdherence;
  fat: MacroAdherence;
  globalAdherence: number;
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  birthDate?: string;
  biologicalSex?: string;
}

export interface MealLog {
  id: string;
  userID: string;
  mealTitle: string;
  mealDescription: string;
  mealItems: MealItem[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  loggedAt?: string;
}

export interface MealLogHistoryEntry {
  id: string;
  loggedAt: string;
  mealTitle: string;
  mealDescription: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

export interface MealLogDay {
  date: string;
  meals: MealLogHistoryEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

function mapUser(raw: any): ApiUser {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    birthDate: raw.birth_date ?? raw.birthDate,
    biologicalSex: raw.biological_sex ?? raw.biologicalSex,
  };
}

function mapMealLog(raw: any): MealLog {
  return {
    id: raw.id,
    userID: raw.user_id ?? raw.userID ?? "",
    mealTitle: raw.meal_title ?? raw.mealTitle ?? "Meal",
    mealDescription: raw.meal_description ?? raw.mealDescription ?? "",
    mealItems: Array.isArray(raw.meal_items)
      ? raw.meal_items.map((i: any) => ({
          item: i.item ?? "",
          quantity: i.quantity ?? 0,
          unit: i.unit ?? "",
          protein: i.protein ?? 0,
          carbs: i.carbs ?? 0,
          fat: i.fat ?? 0,
          calories: i.calories ?? 0,
        }))
      : [],
    calories: raw.calories ?? 0,
    protein: raw.protein ?? 0,
    carbs: raw.carbs ?? 0,
    fat: raw.fat ?? 0,
    loggedAt: raw.logged_at ?? raw.loggedAt,
  };
}

function mapMealLogHistoryEntry(raw: any): MealLogHistoryEntry {
  return {
    id: raw.id ?? "",
    loggedAt: raw.logged_at ?? raw.loggedAt ?? "",
    mealTitle: raw.meal_title ?? raw.mealTitle ?? "",
    mealDescription: raw.meal_description ?? raw.mealDescription ?? "",
    protein: raw.protein ?? 0,
    carbs: raw.carbs ?? 0,
    fat: raw.fat ?? 0,
    calories: raw.calories ?? 0,
  };
}

function mapMealLogDay(raw: any): MealLogDay {
  return {
    date: raw.date,
    meals: Array.isArray(raw.meals) ? raw.meals.map(mapMealLogHistoryEntry) : [],
    totalCalories: raw.total_calories ?? 0,
    totalProtein: raw.total_protein ?? 0,
    totalCarbs: raw.total_carbs ?? 0,
    totalFat: raw.total_fat ?? 0,
  };
}

function mapProject(raw: any): Project {
  return {
    id: raw.id,
    name: raw.name,
    isActive: raw.isActive ?? raw.is_active ?? false,
    userID: raw.userID ?? raw.user_id ?? "",
  };
}

function mapGoal(raw: any): Goal {
  return {
    id: raw.id,
    name: raw.name,
    isActive: raw.isActive ?? raw.is_active ?? false,
    projectID: raw.projectID ?? raw.project_id ?? "",
    strategyType: raw.strategyType ?? raw.strategy_type ?? "",
  };
}

function mapProtocol(raw: any): Protocol {
  return {
    id: raw.id,
    name: raw.name,
    isActive: raw.isActive ?? raw.is_active ?? false,
    goalID: raw.goalID ?? raw.goal_id ?? "",
  };
}

export async function fetchUsers(): Promise<ApiUser[]> {
  // Rota interna do Next para evitar CORS/mixed-content no browser.
  const res = await fetch("/api/users", { method: "GET", cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Erro ao listar usuários (${res.status})`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data.map(mapUser) : [];
}

export async function getUser(id: string): Promise<ApiUser> {
  const res = await fetch(`/api/users/${id}`, { method: "GET", cache: "no-store" });
  if (!res.ok) throw new Error(`Erro ao buscar usuário (${res.status})`);
  return mapUser(await res.json());
}

export async function updateUser(id: string, data: Partial<ApiUser>): Promise<void> {
  const res = await fetch(`/api/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      birth_date: data.birthDate,
      biological_sex: data.biologicalSex,
    }),
  });
  if (!res.ok) throw new Error(`Erro ao atualizar usuário (${res.status})`);
}

export async function createUser(data: Partial<ApiUser>): Promise<ApiUser> {
  const res = await fetch(`/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      birth_date: data.birthDate,
      biological_sex: data.biologicalSex,
    }),
  });
  if (!res.ok) throw new Error(`Erro ao criar usuário (${res.status})`);
  return mapUser(await res.json());
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Erro ao excluir usuário (${res.status})`);
}

export async function fetchMealLogs(userId: string): Promise<MealLog[]> {
  const res = await fetch(`/api/meal-log?user_id=${userId}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Erro ao listar meal logs (${res.status})`);
  const data = await res.json();
  return Array.isArray(data) ? data.map(mapMealLog) : [];
}

export async function fetchMealLogHistory(userId: string): Promise<MealLogDay[]> {
  const res = await fetch(`/api/meal-log/history?user_id=${userId}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Erro ao listar meal log history (${res.status})`);
  const data = await res.json();
  return Array.isArray(data) ? data.map(mapMealLogDay) : [];
}

export async function createMealLog(data: {
  user_id: string;
  meal_title: string;
  meal_description: string;
}): Promise<MealLog> {
  const res = await fetch("/api/meal-log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Erro ao criar meal log (${res.status})`);
  return mapMealLog(await res.json());
}

export async function updateMealLog(
  id: string,
  data: { meal_title?: string; meal_description?: string }
): Promise<MealLog> {
  const res = await fetch(`/api/meal-log/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Erro ao atualizar meal log (${res.status})`);
  return mapMealLog(await res.json());
}

export async function deleteMealLog(id: string): Promise<void> {
  const res = await fetch(`/api/meal-log/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Erro ao excluir meal log (${res.status})`);
}

export async function fetchProjects(userId: string): Promise<Project[]> {
  const res = await fetch(`/api/project?user_id=${userId}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Erro ao listar projetos (${res.status})`);
  const data = await res.json();
  return Array.isArray(data) ? data.map(mapProject) : [];
}

export async function getProject(id: string): Promise<Project> {
  const res = await fetch(`/api/project/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Erro ao buscar projeto (${res.status})`);
  return mapProject(await res.json());
}

export async function updateProject(
  id: string,
  data: { name?: string; is_active?: boolean }
): Promise<Project> {
  const res = await fetch(`/api/project/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Erro ao atualizar projeto (${res.status})`);
  return mapProject(await res.json());
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`/api/project/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Erro ao excluir projeto (${res.status})`);
}

export async function fetchGoals(projectId: string): Promise<Goal[]> {
  const res = await fetch(`/api/goal?project_id=${projectId}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Erro ao listar goals (${res.status})`);
  const data = await res.json();
  return Array.isArray(data) ? data.map(mapGoal) : [];
}

export async function getGoal(id: string): Promise<Goal> {
  const res = await fetch(`/api/goal/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Erro ao buscar goal (${res.status})`);
  return mapGoal(await res.json());
}

export async function updateGoal(
  id: string,
  data: { name?: string; strategy_type?: string; is_active?: boolean }
): Promise<Goal> {
  const res = await fetch(`/api/goal/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Erro ao atualizar goal (${res.status})`);
  return mapGoal(await res.json());
}

export async function deleteGoal(id: string): Promise<void> {
  const res = await fetch(`/api/goal/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Erro ao excluir goal (${res.status})`);
}

export async function fetchProtocols(goalId: string): Promise<Protocol[]> {
  const res = await fetch(`/api/protocol?goal_id=${goalId}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Erro ao listar protocolos (${res.status})`);
  const data = await res.json();
  return Array.isArray(data) ? data.map(mapProtocol) : [];
}

export async function getProtocol(id: string): Promise<Protocol> {
  const res = await fetch(`/api/protocol/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Erro ao buscar protocolo (${res.status})`);
  return mapProtocol(await res.json());
}

export async function updateProtocol(
  id: string,
  data: { name?: string; is_active?: boolean }
): Promise<Protocol> {
  const res = await fetch(`/api/protocol/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Erro ao atualizar protocolo (${res.status})`);

  const current = await getProtocol(id);
  return {
    ...current,
    name: data.name ?? current.name,
    isActive: data.is_active ?? current.isActive,
  };
}

export async function deleteProtocol(id: string): Promise<void> {
  const res = await fetch(`/api/protocol/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Erro ao excluir protocolo (${res.status})`);
}

function mapDietPlan(r: any): DietPlan {
  return {
    id: r.id,
    protocolId: r.protocol_id ?? r.protocolId ?? "",
    calories: r.calories ?? 0,
    protein: r.protein ?? 0,
    carbs: r.carbs ?? 0,
    fat: r.fat ?? 0,
    water: r.water ?? 0,
    isActive: r.is_active ?? r.isActive ?? false,
    calorieIntensity: r.calorie_intensity ?? r.calorieIntensity ?? "",
    proteinIntensity: r.protein_intensity ?? r.proteinIntensity ?? "",
    fatIntensity: r.fat_intensity ?? r.fatIntensity ?? "",
  };
}

export async function fetchDietPlans(protocolId: string): Promise<DietPlan[]> {
  const res = await fetch(`/api/diet-plan?protocol_id=${protocolId}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Erro ao listar diet plans (${res.status})`);
  const data = await res.json();
  return Array.isArray(data) ? data.map(mapDietPlan) : [];
}

export async function getDietPlan(id: string): Promise<DietPlan> {
  const res = await fetch(`/api/diet-plan/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Erro ao buscar diet plan (${res.status})`);
  return mapDietPlan(await res.json());
}

export async function updateDietPlan(
  id: string,
  data: {
    calorie_intensity?: string;
    protein_intensity?: string;
    fat_intensity?: string;
    is_active?: boolean;
  }
): Promise<void> {
  const res = await fetch(`/api/diet-plan/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Erro ao atualizar diet plan (${res.status})`);
}

export async function deleteDietPlan(id: string): Promise<void> {
  const res = await fetch(`/api/diet-plan/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Erro ao excluir diet plan (${res.status})`);
}

export interface Assessment {
  id: string;
  userID: string;
  height: number;
  weight: number;
  bodyFat: number;
  activityLevel: string;
  bmi: number;
  bmr: number;
  tdee: number;
  recordedAt?: string;
}

export interface AssessmentHistoryEntry {
  id: string;
  recordedAt: string;
  weight: number;
  bodyFat: number;
  bmi: number;
  bmr: number;
  tdee: number;
}

function mapAssessment(r: any): Assessment {
  return {
    id: r.id ?? "",
    userID: r.user_id ?? r.userID ?? "",
    height: r.height ?? 0,
    weight: r.weight ?? 0,
    bodyFat: r.body_fat ?? r.bodyFat ?? 0,
    activityLevel: r.activity_level ?? r.activityLevel ?? "",
    bmi: r.bmi ?? 0,
    bmr: r.bmr ?? 0,
    tdee: r.tdee ?? 0,
    recordedAt: r.recorded_at ?? r.recordedAt,
  };
}

export async function fetchAssessments(userId: string): Promise<Assessment[]> {
  const res = await fetch(`/api/assessment?user_id=${userId}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Erro ao listar assessments (${res.status})`);
  const data = await res.json();
  return Array.isArray(data) ? data.map(mapAssessment) : [];
}

export async function getAssessment(id: string): Promise<Assessment> {
  const res = await fetch(`/api/assessment/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Erro ao buscar assessment (${res.status})`);
  return mapAssessment(await res.json());
}

export async function updateAssessment(
  id: string,
  data: { weight?: number; height?: number; body_fat?: number; activity_level?: string }
): Promise<Assessment> {
  const res = await fetch(`/api/assessment/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Erro ao atualizar assessment (${res.status})`);
  return mapAssessment(await res.json());
}

export async function deleteAssessment(id: string): Promise<void> {
  const res = await fetch(`/api/assessment/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Erro ao excluir assessment (${res.status})`);
}

export async function fetchAssessmentHistory(userId: string): Promise<AssessmentHistoryEntry[]> {
  const res = await fetch(`/api/assessment/history?user_id=${userId}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Erro ao buscar histórico de assessments (${res.status})`);
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((r: any) => ({
    id: r.id ?? "",
    recordedAt: r.recorded_at ?? r.recordedAt ?? "",
    weight: r.weight ?? 0,
    bodyFat: r.body_fat ?? r.bodyFat ?? 0,
    bmi: r.bmi ?? 0,
    bmr: r.bmr ?? 0,
    tdee: r.tdee ?? 0,
  }));
}

export async function createAssessment(data: {
  user_id: string;
  height: number;
  weight: number;
  body_fat: number;
  activity_level: string;
}): Promise<Assessment> {
  const res = await fetch("/api/assessment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Erro ao criar assessment (${res.status})`);
  const r = await res.json();
  return {
    id: r.id,
    userID: r.userID ?? r.user_id ?? "",
    height: r.height ?? 0,
    weight: r.weight ?? 0,
    bodyFat: r.body_fat ?? r.bodyFat ?? 0,
    activityLevel: r.activity_level ?? r.activityLevel ?? "",
    bmi: r.bmi ?? 0,
    bmr: r.bmr ?? 0,
    tdee: r.tdee ?? 0,
    recordedAt: r.recorded_at ?? r.recordedAt,
  };
}

export async function createProject(data: { name: string; user_id: string }): Promise<Project> {
  const res = await fetch("/api/project", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Erro ao criar projeto (${res.status})`);
  return mapProject(await res.json());
}

export async function createGoal(data: {
  name: string;
  project_id: string;
  strategy_type: string;
}): Promise<Goal> {
  const res = await fetch("/api/goal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Erro ao criar goal (${res.status})`);
  return mapGoal(await res.json());
}

export async function createProtocol(data: { name: string; goal_id: string }): Promise<Protocol> {
  const res = await fetch("/api/protocol", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Erro ao criar protocolo (${res.status})`);
  return mapProtocol(await res.json());
}

export async function createDietPlan(data: {
  protocol_id: string;
  calorie_intensity: string;
  protein_intensity: string;
  fat_intensity: string;
}): Promise<DietPlan> {
  const res = await fetch("/api/diet-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Erro ao criar diet plan (${res.status})`);
  return mapDietPlan(await res.json());
}

// ── Macro Estimation ──────────────────────────────────────────────────────────

export interface MealItem {
  item: string;
  quantity: number;
  unit: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

export interface MacroEstimation {
  id: string;
  userID: string;
  mealDescription: string;
  mealItems: MealItem[];
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

function mapMacroEstimation(r: any): MacroEstimation {
  return {
    id: r.id ?? "",
    userID: r.user_id ?? r.userID ?? "",
    mealDescription: r.meal_description ?? r.mealDescription ?? "",
    mealItems: Array.isArray(r.meal_items)
      ? r.meal_items.map((i: any) => ({
          item: i.item ?? "",
          quantity: i.quantity ?? 0,
          unit: i.unit ?? "",
          protein: i.protein ?? 0,
          carbs: i.carbs ?? 0,
          fat: i.fat ?? 0,
          calories: i.calories ?? 0,
        }))
      : [],
    protein: r.protein ?? 0,
    carbs: r.carbs ?? 0,
    fat: r.fat ?? 0,
    calories: r.calories ?? 0,
  };
}

export async function estimateMacros(
  userId: string,
  mealTitle: string,
  mealDescription: string
): Promise<MacroEstimation> {
  const description = mealTitle
    ? `[${mealTitle}] ${mealDescription}`
    : mealDescription;
  const res = await fetch("/api/macro-estimation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, meal_description: description }),
  });
  if (!res.ok) throw new Error(`Erro ao estimar macros (${res.status})`);
  return mapMacroEstimation(await res.json());
}

export async function listMacroEstimations(userId: string): Promise<MacroEstimation[]> {
  const res = await fetch(`/api/macro-estimation?user_id=${userId}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Erro ao listar estimações (${res.status})`);
  const data = await res.json();
  return Array.isArray(data) ? data.map(mapMacroEstimation) : [];
}

export async function deleteMacroEstimation(id: string): Promise<void> {
  const res = await fetch(`/api/macro-estimation/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Erro ao excluir estimação (${res.status})`);
}

export async function fetchDietPlanAdherence(
  dietPlanId: string,
  userId: string
): Promise<DietPlanAdherence> {
  const res = await fetch(
    `/api/diet-plan/adherence?diet_plan_id=${dietPlanId}&user_id=${userId}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error(`Erro ao buscar adherence (${res.status})`);
  const r = await res.json();
  const mapMacro = (m: any): MacroAdherence => ({
    consumed: m?.consumed ?? 0,
    target: m?.target ?? 0,
    adherence: m?.adherence ?? 0,
  });
  return {
    dietPlanId: r.diet_plan_id ?? "",
    date: r.date ?? "",
    calories: mapMacro(r.calories),
    protein: mapMacro(r.protein),
    carbs: mapMacro(r.carbs),
    fat: mapMacro(r.fat),
    globalAdherence: r.global_adherence ?? 0,
  };
}
