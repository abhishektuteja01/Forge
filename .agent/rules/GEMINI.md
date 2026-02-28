---
trigger: manual
---

# AGENTS.md — Forge

> **Agent Instructions:** You are working on Forge. Follow all conventions strictly — do not deviate from the tech stack, folder structure, naming, or approved dependencies. Match the data model exactly for queries and migrations. Use the design tokens for all UI. If something is ambiguous, ask — do not guess.

> Forge is a mobile-first habit-building web app based on *Atomic Habits* by James Clear. It implements Habits Scorecard, Habit Stacking, Identity-Based Voting, and (Sprint 2) Four Laws Audit + Compound Growth Visualizer. All insights are rule-based — no AI/ML in the product.

> **References:** Full PRD with acceptance criteria, data model, and sprint plan: see `Atomic_PRD.md` in Project Memory folder. Mockups/prototype: see screenshots in Project Memory folder respectively.

---

## Tech Stack & Dependencies

| Layer        | Technology                                  |
|--------------|---------------------------------------------|
| Framework    | Next.js 14 (App Router)                     |
| UI           | React 18, Tailwind CSS (mobile-first)       |
| Language     | TypeScript (strict mode)                    |
| Backend/DB   | Supabase (PostgreSQL + Auth + Realtime)     |
| Auth         | Supabase Auth (email/password + Google OAuth)|
| Hosting      | Vercel                                      |
| Package Mgr  | npm                                         |

**Approved dependencies only** — do not add others without team discussion: `next`, `react`, `react-dom`, `@supabase/supabase-js`, `@supabase/ssr`, `tailwindcss`, `postcss`, `autoprefixer`, `recharts` (Sprint 2), `lucide-react`, `vitest`, `@testing-library/react`, `@playwright/test`.

---

## Architecture

Next.js App Router with Server Components by default. Client Components (`"use client"`) only for forms, interactive UI, hooks, and real-time elements. Supabase handles all backend — no custom API layer for MVP.

**Data access:** Server client (`lib/supabase/server.ts`) in Server Components; browser client (`lib/supabase/client.ts`) in Client Components. RLS enforces user isolation. Never expose `service_role` key client-side.

**Auth:** Middleware (`lib/supabase/middleware.ts`) protects `(dashboard)` routes. Unauthenticated → redirect to `/login`. Sessions persist via Supabase.

**RLS pattern** — apply to every table with `user_id`:
```sql
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own data" ON routines FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

**Migrations:** `supabase/migrations/` with timestamp prefix: `20240101000000_create_profiles.sql`

### Folder Structure

```
forge/
├── src/
│   ├── app/
│   │   ├── (auth)/login/ & signup/
│   │   ├── (dashboard)/scorecard/ stacks/ identity/ audit/ visualizer/ partners/
│   │   │   └── layout.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/          # Button, Card, Modal, Input, Badge, ProgressBar
│   │   ├── scorecard/   # RoutineList, RoutineItem, AddRoutineForm, DailyCheckIn, ScorecardSummary
│   │   ├── stacks/      # StackBuilder, StackChain, StackCard
│   │   ├── identity/    # IdentityCard, IdentityForm, VoteCounter
│   │   └── layout/      # MobileNav, Header, Sidebar
│   ├── lib/supabase/    # client.ts, server.ts, middleware.ts
│   ├── hooks/           # useRoutines, useCheckIns, useStacks, useIdentities
│   ├── types/           # database.ts, routines.ts, stacks.ts, identities.ts
│   └── styles/globals.css
├── supabase/migrations/
├── e2e/                 # Playwright E2E tests
├── playwright.config.ts
└── package.json
```

---

## Conventions

### Naming

| What             | Convention                | Example                          |
|------------------|---------------------------|----------------------------------|
| Pages/folders    | lowercase kebab           | `scorecard/page.tsx`             |
| Components       | PascalCase                | `RoutineItem.tsx`                |
| Hooks            | camelCase + `use`         | `useRoutines.ts`                 |
| Functions        | camelCase                 | `handleSubmit`, `formatDate`     |
| Constants        | UPPER_SNAKE_CASE          | `MAX_STACK_DEPTH`                |
| Types/Interfaces | PascalCase                | `Routine`, `CheckInRecord`       |
| DB columns       | snake_case                | `user_id`, `created_at`          |

### TypeScript

Strict mode — never use `any`. Export types from `types/` directory. Prefer `interface` for object shapes, `type` for unions. Always type params and returns on exported functions.

### React

Functional components only. Named exports (default only for `page.tsx`). One responsibility per component. Extract to hooks at ~80 lines. Props interface named `{ComponentName}Props`, destructured in signature.

```tsx
interface RoutineItemProps {
  routine: Routine;
  onToggle: (id: string) => void;
}
export function RoutineItem({ routine, onToggle }: RoutineItemProps) { ... }
```

### State Management

React hooks for local state. Supabase real-time for synced data. No Redux/Zustand/MobX. Lift state to nearest common parent when needed.

### Styling

Tailwind utilities in JSX — no separate CSS files. `@apply` in `globals.css` only if used 3+ places. No inline styles. No hardcoded colors — use design tokens below. Mobile-first (375px base). `sm:` 640px, `md:` 768px (sidebar nav, wider cards), `lg:` 1024px (max content 768px centered). All touch targets min 44×44px.

### Error Handling

Wrap Supabase calls in try/catch. User-friendly messages via toast/inline. Console-log in dev only. Use `error.tsx` boundaries for page-level errors.

### Key Rules

**Do:** semantic HTML, `aria-label` on icon buttons, loading states for async, `<Link>` for nav, `next/image` for images, validate input client + server, descriptive names.

**Don't:** use `any`, install unapproved deps, create API routes for CRUD (use Supabase + RLS), put logic in components (extract to hooks/utils), use `useEffect` for fetching, suppress TS/ESLint errors without comments, commit `.env.local`.

---

## Design Tokens

| Purpose        | Tailwind Class                     |
|----------------|------------------------------------|
| Positive habit | `text-green-500` / `bg-green-500`  |
| Negative habit | `text-red-500` / `bg-red-500`      |
| Neutral habit  | `text-gray-400` / `bg-gray-400`    |
| Primary accent | `text-indigo-500` / `bg-indigo-500`|
| Background     | `bg-white`                         |
| Surface        | `bg-gray-50`                       |
| Text primary   | `text-gray-900`                    |
| Text secondary | `text-gray-500`                    |
| Border         | `border-gray-200`                  |

---

## Data Model

### profiles
`id` uuid PK (→ auth.users), `display_name` text, `onboarding_complete` boolean (default false), `created_at` timestamptz, `updated_at` timestamptz.

### routines
`id` uuid PK, `user_id` uuid FK (→ profiles), `name` text, `tag` text ('positive'|'negative'|'neutral'), `time_of_day` text nullable ('morning'|'afternoon'|'evening'|'night'), `sort_order` integer, `created_at` timestamptz, `updated_at` timestamptz.

### check_ins
`id` uuid PK, `user_id` uuid FK (→ profiles), `routine_id` uuid FK (→ routines), `date` date, `completed` boolean (default false), `created_at` timestamptz. **Unique constraint:** `(routine_id, date)`.

### habit_stacks
`id` uuid PK, `user_id` uuid FK (→ profiles), `anchor_routine_id` uuid FK (→ routines), `stacked_routine_id` uuid FK (→ routines), `position` integer, `created_at` timestamptz.

### identities
`id` uuid PK, `user_id` uuid FK (→ profiles), `statement` text, `created_at` timestamptz, `updated_at` timestamptz.

### identity_habits
`id` uuid PK, `identity_id` uuid FK (→ identities), `routine_id` uuid FK (→ routines).

> **Votes are not stored.** A vote = a completed check-in for a linked routine. Join `check_ins` with `identity_habits` where `completed = true`.

> **Deletion:** Prefer soft-delete (`archived_at timestamptz`) for routines and identities — hard-delete orphans FK references. Filter with `WHERE archived_at IS NULL`.

---

## Sprint 1 — User Stories

**Team:** Abhishek Tuteja (Auth, Supabase schema, Scorecard, Onboarding) · Derek Zhang (Stacking, Identity Voting, Nav/Layout)

- **US-1 (Abhishek):** Scorecard — add/edit/delete routines with name, tag (positive/negative/neutral), optional time of day. Dashboard shows breakdown. Supabase-persisted. Mobile-responsive.
- **US-2 (Abhishek):** Daily check-in — today's routines as checklist, mark done/not done, date-stamped, view past days, completion rate indicator.
- **US-3 (Derek):** Habit stacking — select anchor routine, define stacked habit ("After X, I will Y"), chains of 2+, visible in check-in, editable.
- **US-4 (Derek):** Visual stacks — vertical chain/flow diagram, tag colors, completed distinguished, mobile-friendly.
- **US-5 (Derek):** Identity statements — create/edit/delete, link to habits, display on dashboard.
- **US-6 (Derek):** Vote counter — completing linked habit increments votes, progress bar, daily/weekly history.
- **US-7 (Abhishek):** Auth — email/password + Google OAuth, error messages, protected routes, logout, session persistence.
- **US-8 (Abhishek):** Onboarding — 2–3 steps, add 3 routines + tags, skippable, lands on populated dashboard.

**Sprint 2:** Four Laws Audit, Compound Visualizer, Accountability Partners, Progressive Disclosure.

---

## Testing

**Unit:** Vitest + React Testing Library. **E2E:** Playwright. Unit tests co-located (`{file}.test.tsx`). E2E tests in `e2e/{feature}.spec.ts`. Test hooks, interactions, utils — not implementation details. Aim 70%+ on hooks/utils.

---

## Git Workflow

**Sprints:** 1 week. Board: Backlog → Sprint Todo → In Progress → In Review → Done.

**Branches:** `<type>/<issue>-<desc>` from `main`. Types: `feature/`, `fix/`, `chore/`, `docs/`. Example: `feature/1-scorecard-list-routines`. Delete after merge.

**Commits:** `<type>: <description> #<issue>`. Types: `feat`, `fix`, `style`, `refactor`, `test`, `chore`, `docs`. Present tense, under 72 chars, one change per commit.

**PRs:** Title: `[Type] Description (#issue)`. Body: What, Why (`Closes #X`), How, Screenshots (required for UI). Squash and merge. Teammate review required.

**Done when:** acceptance criteria met, conventions followed, works at 375px, no TS/ESLint errors, PR approved, branch deleted, issue closed.