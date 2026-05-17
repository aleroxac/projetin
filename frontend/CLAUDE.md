# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

ProjetIn is an AI-powered fitness tracking and meal planning app. This is the **Next.js frontend** (App Router, React 19, TypeScript). The backend is a Go API in `../backend/`.

## Commands

```bash
npm run dev      # Dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

## Architecture

The app is a single-page dashboard with 3 tabs (Workout, Diet, Shape), each rendering a configurable grid of draggable widgets.

**Data flow for state:**
`Dashboard.tsx` (tab + widget state) → `WidgetGrid.tsx` (@dnd-kit sortable) → `Widget.tsx` → individual widget in `components/widgets/`

**Widget system:**
- `lib/widgetData.ts` holds `WIDGET_REGISTRY` (all available widgets) and `DEFAULT_WIDGETS` (per-tab defaults). Each widget entry declares `id`, `title`, `component`, `tab`, `colSpan`, and `rowSpan`.
- `WidgetPalette.tsx` lets users add/remove widgets from the active tab at runtime.
- To add a new widget: create the component in `components/widgets/`, register it in `WIDGET_REGISTRY`, and add its `id` to `DEFAULT_WIDGETS` for the relevant tab.

**Import alias:** Use `@/` for imports from the project root (e.g., `@/lib/utils`, `@/components/ui/button`).

**Styling:** Dark theme via CSS custom properties defined in `app/globals.css` (`--bg`, `--surface`, `--text`, `--blue`, etc.). Use Tailwind utility classes referencing these variables. shadcn/ui components live in `components/ui/` and use Radix UI primitives.

**Charts:** All data visualization uses `recharts`. Mock/static data is currently hardcoded inside each widget component — there is no API integration yet.

**Notifications:** Use `sonner` toast via `import { toast } from 'sonner'`. The `<Toaster />` is mounted in `app/layout.tsx`.

## Backend Integration & Context Boundary
- **STRICT RULE:** Do not explore the `../backend/internal/` logic or services.
- **API Contracts:** Use `../backend/docs/swagger.json` as the ONLY source of truth for endpoints.
- **Data Structures:** Refer to `../backend/internal/dto/` ONLY to mirror types into TypeScript interfaces.
- **Implementation:** All API calls must be implemented in `lib/api/` (or your specific folder).

## Type Mapping
- All backend DTOs are mapped in `lib/types.ts`.
- Before asking the backend, check if the type already exists in this file.
