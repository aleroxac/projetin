# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

ProjetIn is an AI-powered fitness tracking and meal planning app. This is the **Next.js 15 frontend** (App Router, React 19, TypeScript). The backend is a Go API in `../backend/`.

## Commands

```bash
npm run dev      # Dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

---

## App Structure

### Pages & Navigation

The app has two navigation layers:

**Sidebar sections** (`components/Sidebar.tsx`):
- **Main**: Dashboard (`/dashboard`), Assessments (`/assessments`), Projects (`/projects`)
- **Health**: Nutrition (`/nutrition`), Workouts (not yet routed), Analytics (not yet routed)
- **System**: Utils (not yet routed), Settings (not yet routed)

**Shell wiring** — `components/RouteShell.tsx` wraps every page with the Sidebar + Header + Footer grid. To add a new page:
1. Add a `routeMeta` entry in `RouteShell.tsx` for the new pathname.
2. Add a navigation case in `Sidebar.tsx` (`routeNav` memo + `handleNavItemClick`).
3. Create `app/<route>/page.tsx` that renders a `<XxxView />` component.
4. Create `components/XxxView.tsx` with `"use client"`.

### Dashboard Widget System

`/dashboard` uses a drag-and-drop canvas of widgets per tab (Diet, Workout, Shape).

- `lib/widgetData.ts` — `WIDGET_REGISTRY` (all widgets) + `DEFAULT_LAYOUTS` (per-tab defaults).
- `lib/types.ts` — `TabId`, `WidgetMeta`, `WidgetLayout`.
- To add a widget: create `components/widgets/XxxWidget.tsx`, register in `WIDGET_REGISTRY`, add to `DEFAULT_LAYOUTS`, add a `case` in `WidgetContent.tsx`.

### localStorage Keys

| Key | Value |
|-----|-------|
| `projetin:user:id` | Current user UUID |
| `projetin:user:name` | Current user name |
| `projetin:user:email` | Current user email |
| `projetin:diet:dietPlanId` | Active diet plan UUID |
| `projetin:dashboard:layouts:v1` | Serialized widget layouts |

---

## Backend Integration

### Rules

- **Do NOT** explore `../backend/internal/` beyond the DTO files.
- **DTOs** live in `../backend/internal/dto/` — use them as the source of truth for payload shapes.
- **All API calls** go through Next.js proxy routes in `app/api/` to avoid CORS. Never call `API_BASE_URL` directly from client components.
- `API_BASE_URL` is `process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1"` (used only in server-side proxy routes).

### Proxy Pattern

Every backend resource needs a Next.js proxy route. Follow the existing pattern:

```ts
// app/api/<resource>/route.ts
import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const res = await fetch(`${API_BASE_URL}/<resource>?${searchParams}`, { cache: "no-store" });
  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: res.status });
  return NextResponse.json(await res.json());
}

export async function POST(request: Request) {
  const res = await fetch(`${API_BASE_URL}/<resource>`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await request.json()),
  });
  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: res.status });
  return NextResponse.json(await res.json(), { status: 201 });
}
```

For dynamic `[id]` routes (Next.js 15 — `params` is a Promise):

```ts
// app/api/<resource>/[id]/route.ts
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${API_BASE_URL}/<resource>/${id}`, { method: "DELETE" });
  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: res.status });
  return NextResponse.json(await res.json());
}
```

### Existing Proxy Routes

| Frontend proxy | Backend endpoint |
|---------------|-----------------|
| `GET/POST /api/users` | `/api/v1/user` |
| `GET/PUT/DELETE /api/users/[id]` | `/api/v1/user/:id` |
| `GET/POST /api/assessment` | `/api/v1/assessment` |
| `GET /api/assessment/history` | `/api/v1/assessment/history` |
| `GET/PUT/DELETE /api/assessment/[id]` | `/api/v1/assessment/:id` |
| `GET/POST /api/project` | `/api/v1/project` |
| `GET/PUT/DELETE /api/project/[id]` | `/api/v1/project/:id` |
| `GET/POST /api/goal` | `/api/v1/goal` |
| `GET/PUT/DELETE /api/goal/[id]` | `/api/v1/goal/:id` |
| `GET/POST /api/protocol` | `/api/v1/protocol` |
| `GET/PUT/DELETE /api/protocol/[id]` | `/api/v1/protocol/:id` |
| `GET/POST /api/diet-plan` | `/api/v1/diet-plan` |
| `GET /api/diet-plan/adherence` | `/api/v1/diet-plan/adherence` |
| `GET/PUT/DELETE /api/diet-plan/[id]` | `/api/v1/diet-plan/:id` |
| `GET/POST /api/macro-estimation` | `/api/v1/macro-estimation` |
| `DELETE /api/macro-estimation/[id]` | `/api/v1/macro-estimation/:id` |
| `GET/POST /api/meal-log` | `/api/v1/meal-log` |
| `GET /api/meal-log/history` | `/api/v1/meal-log/history` |
| `GET/PUT/DELETE /api/meal-log/[id]` | `/api/v1/meal-log/:id` |

---

## Backend Endpoint Catalog

All endpoints share base path `/api/v1`. JSON keys are **snake_case** from the backend; map them to camelCase in `lib/api.ts`.

### User — `/user`

| Method | Path | Query | Body | Response |
|--------|------|-------|------|----------|
| POST | `/` | — | `{ name, email, biological_sex, birth_date: "YYYY-MM-DD" }` | `UserOutputDTO` |
| GET | `/` | — | — | `UserOutputDTO[]` |
| GET | `/:id` | — | — | `UserOutputDTO` |
| PUT | `/:id` | — | `{ name?, email?, biological_sex?, birth_date? }` | — |
| DELETE | `/:id` | — | — | — |

`UserOutputDTO`: `{ id, name, email, biological_sex, birth_date }`

### Assessment — `/assessment`

| Method | Path | Query | Body | Response |
|--------|------|-------|------|----------|
| POST | `/` | — | `{ user_id, weight, height, body_fat, activity_level }` | `AssessmentOutputDTO` |
| GET | `/` | `user_id` | — | `AssessmentOutputDTO[]` |
| GET | `/history` | `user_id` | — | `AssessmentHistoryEntryDTO[]` |
| GET | `/:id` | — | — | `AssessmentOutputDTO` |
| PUT | `/:id` | — | `{ weight?, height?, body_fat?, activity_level? }` | `AssessmentOutputDTO` |
| DELETE | `/:id` | — | — | — |

`AssessmentOutputDTO`: `{ id, user_id, weight, height, body_fat, activity_level, bmi, bmr, tdee }`
`AssessmentHistoryEntryDTO`: `{ id, recorded_at, weight, body_fat, bmi, bmr, tdee }`

`activity_level` values: `sedentary` | `lightly_active` | `moderately_active` | `very_active` | `extremely_active`

### Project — `/project`

| Method | Path | Query | Body | Response |
|--------|------|-------|------|----------|
| POST | `/` | — | `{ user_id, name }` | `ProjectOutputDTO` |
| GET | `/` | `user_id` | — | `ProjectOutputDTO[]` |
| GET | `/:id` | — | — | `ProjectOutputDTO` |
| PUT | `/:id` | — | `{ name?, is_active? }` | `ProjectOutputDTO` |
| DELETE | `/:id` | — | — | — |

`ProjectOutputDTO`: `{ id, user_id, name, is_active }`

### Goal — `/goal`

| Method | Path | Query | Body | Response |
|--------|------|-------|------|----------|
| POST | `/` | — | `{ project_id, name, strategy_type }` | `GoalOutputDTO` |
| GET | `/` | `project_id` | — | `GoalOutputDTO[]` |
| GET | `/:id` | — | — | `GoalOutputDTO` |
| PUT | `/:id` | — | `{ name?, strategy_type?, is_active? }` | `GoalOutputDTO` |
| DELETE | `/:id` | — | — | — |

`GoalOutputDTO`: `{ id, project_id, name, strategy_type, is_active }`

### Protocol — `/protocol`

| Method | Path | Query | Body | Response |
|--------|------|-------|------|----------|
| POST | `/` | — | `{ goal_id, name }` | `ProtocolOutputDTO` |
| GET | `/` | `goal_id` | — | `ProtocolOutputDTO[]` |
| GET | `/:id` | — | — | `ProtocolOutputDTO` |
| PUT | `/:id` | — | `{ name?, is_active? }` | `ProtocolOutputDTO` |
| DELETE | `/:id` | — | — | — |

`ProtocolOutputDTO`: `{ id, goal_id, name, is_active }`

### Diet Plan — `/diet-plan`

| Method | Path | Query | Body | Response |
|--------|------|-------|------|----------|
| POST | `/` | — | `{ protocol_id, calorie_intensity, protein_intensity, fat_intensity }` | `DietPlanOutputDTO` |
| GET | `/` | `protocol_id` | — | `DietPlanOutputDTO[]` |
| GET | `/adherence` | `diet_plan_id`, `user_id` | — | `DietPlanAdherenceOutputDTO` |
| GET | `/:id` | — | — | `DietPlanOutputDTO` |
| PUT | `/:id` | — | `{ calorie_intensity?, protein_intensity?, fat_intensity?, protein?, carbs?, fat?, calories?, water?, is_active? }` | — |
| DELETE | `/:id` | — | — | — |

`DietPlanOutputDTO`: `{ id, protocol_id, calorie_intensity, protein_intensity, fat_intensity, protein, carbs, fat, calories, water, is_active }`

`DietPlanAdherenceOutputDTO`: `{ date, diet_plan_id, protein, carbs, fat, calories, global_adherence }` where each macro is `{ target, consumed, adherence }`.

Intensity values: `low` | `moderate` | `high`

### Macro Estimation — `/macro-estimation`

AI-powered — sends a meal description to an LLM and returns structured macros.

| Method | Path | Query | Body | Response |
|--------|------|-------|------|----------|
| POST | `/` | — | `{ user_id, meal_description }` | `MacroEstimationOutputDTO` |
| GET | `/` | `user_id` | — | `MacroEstimationOutputDTO[]` |
| GET | `/:id` | — | — | `MacroEstimationOutputDTO` |
| DELETE | `/:id` | — | — | `{ id, message }` |

`MacroEstimationOutputDTO`: `{ id, user_id, meal_description, meal_items[], protein, carbs, fat, calories }`

`MealItem`: `{ item, quantity, unit, protein, carbs, fat, calories }`

### Meal Log — `/meal-log`

| Method | Path | Query | Body | Response |
|--------|------|-------|------|----------|
| POST | `/` | — | `{ user_id, meal_title, meal_description }` | `MealLogOutputDTO` |
| GET | `/` | `user_id` | — | `MealLogOutputDTO[]` |
| GET | `/history` | `user_id` | — | `MealLogHistoryDayDTO[]` |
| GET | `/:id` | — | — | `MealLogOutputDTO` |
| PUT | `/:id` | — | `{ meal_title?, meal_description? }` | `MealLogOutputDTO` |
| DELETE | `/:id` | — | — | — |

`MealLogOutputDTO`: `{ id, user_id, meal_title, meal_description, meal_items[], protein, carbs, fat, calories }`

`MealLogHistoryDayDTO`: `{ date, meals[], total_protein, total_carbs, total_fat, total_calories }`

`MealLogHistoryEntryDTO`: `{ id, logged_at, meal_title, meal_description, protein, carbs, fat, calories }`

---

## Frontend API Layer (`lib/api.ts`)

Every resource follows the same three-step pattern:

1. **TypeScript interface** (camelCase) mirroring the backend output DTO.
2. **`mapXxx(raw: any)`** function handling both snake_case and camelCase keys for safety.
3. **Exported async functions** calling the `/api/<proxy>` Next.js route (never the backend directly).

All fetch calls use `cache: "no-store"`. Current interfaces: `ApiUser`, `Assessment`, `AssessmentHistoryEntry`, `Project`, `Goal`, `Protocol`, `DietPlan`, `DietPlanAdherence`, `MacroAdherence`, `MealLog`, `MealLogDay`, `MealItem`, `MacroEstimation`.

---

## UI Conventions

**Styling:** Dark theme via CSS custom properties in `app/globals.css`. Always use Tailwind referencing these vars, never hardcode colours.

Key variables: `--bg`, `--bg2`, `--bg3`, `--bg4`, `--surface`, `--border`, `--border2`, `--text`, `--text2`, `--text3`, `--blue`.

Macro colours: `--macro-protein` (#86efac), `--macro-carbs` (#fcd34d), `--macro-fat` (#f9a8d4).

**Components:** shadcn/ui in `components/ui/` (Button, Dialog, etc.) + Radix UI primitives. Import alias `@/`.

**Charts:** `recharts` — `ResponsiveContainer` + `LineChart` / `BarChart`.

**Notifications:** `import { toast } from "sonner"` — `toast.success()`, `toast.error()`, `toast()`.

**Import alias:** `@/` resolves to the project root.
