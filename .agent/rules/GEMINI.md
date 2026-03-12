---
trigger: always_on
---

# AGENTS.md — Forge

Forge is a mobile-first habit-building web app based on *Atomic Habits* by James Clear. Implements Habits Scorecard, Habit Stacking, Identity-Based Voting, and (Sprint 2) Four Laws Audit + Compound Growth Visualizer. All insights rule-based — no AI/ML. Full PRD: `Atomic_PRD.md`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18, Tailwind CSS (mobile-first) |
| Language | TypeScript (strict mode) |
| Backend/DB | Supabase (PostgreSQL + Auth + Realtime) |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Hosting | Vercel |

**Approved deps only:** `next`, `react`, `react-dom`, `@supabase/supabase-js`, `@supabase/ssr`, `tailwindcss`, `postcss`, `autoprefixer`, `recharts` (Sprint 2), `lucide-react`, `zod`, `vitest`, `@testing-library/react`, `@playwright/test`, `eslint`, `eslint-config-next`, `prettier`, `prettier-plugin-tailwindcss`.

---

## Architecture

App Router with Server Components by default. Client Components (`"use client"`) only for forms, interactive UI, hooks, real-time. Supabase handles data via RLS — no custom API layer needed. All CRUD operations go directly through the Supabase client with Row-Level Security enforcing user isolation.

**Data access:** Server client (`lib/supabase/server.ts`) in Server Components; browser client (`lib/supabase/client.ts`) in Client Components. RLS enforces user isolation. Never expose `service_role` key client-side.

**Auth:** Root `middleware.ts` delegates to `lib/supabase/middleware.ts` to protect `(dashboard)` routes. Unauthenticated → redirect `/login`. Google OAuth requires `(auth)/callback/route.ts`.

**Validation:** Zod schemas in `lib/validators/` for all user input. Validate client + server side.

**RLS pattern** (apply to every table with `user_id`):
```sql
CREATE POLICY "Users access own data" ON table_name FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

`identity_habits` has a denormalized `user_id` specifically for this RLS pattern.

**Migrations:** `supabase/migrations/` with timestamp prefix via Supabase CLI. Example: `20260226000000_create_profiles.sql`.

---

## Folder Structure

```
forge/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── callback/route.ts         # OAuth callback
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                  # Dashboard home
│   │   │   ├── scorecard/page.tsx
│   │   │   ├── stacks/page.tsx
│   │   │   ├── identity/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── onboarding/page.tsx           # Standalone, no dashboard nav
│   │   ├── layout.tsx
│   │   ├── page.tsx                      # Landing page
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── ui/                           # Shared: Button, Card, Modal, Input, etc.
│   │   ├── scorecard/                    # Owner: Abhishek
│   │   ├── stacks/                       # Owner: Derek
│   │   ├── identity/                     # Owner: Derek
│   │   ├── onboarding/                   # Owner: Abhishek
│   │   └── layout/                       # Owner: Derek — MobileNav, Header, Sidebar
│   ├── hooks/
│   │   ├── useRoutines.ts                # Abhishek
│   │   ├── useCheckIns.ts                # Abhishek
│   │   ├── useAuth.ts                    # Abhishek
│   │   ├── useStacks.ts                  # Derek
│   │   ├── useIdentities.ts             # Derek
│   │   └── useFeatureFlags.ts
│   ├── lib/
│   │   ├── supabase/                     # client.ts, server.ts, middleware.ts
│   │   ├── validators/                   # routine.ts, identity.ts, stack.ts (Zod)
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── types/
│   │   ├── database.ts                   # Auto-generated Supabase types
│   │   ├── auth.ts                       # Abhishek
│   │   ├── scorecard.ts                  # Abhishek
│   │   ├── stacks.ts                     # Derek
│   │   ├── identity.ts                   # Derek
│   │   └── common.ts                     # Shared enums (Tag, TimeOfDay)
│   └── styles/globals.css
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── config.toml
├── e2e/                                  # Playwright tests
├── .github/
│   └── workflows/ci.yml                 # CI/CD pipeline
├── middleware.ts                          # Root Next.js middleware
├── .env.local                            # Never committed
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── AGENTS.md
├── tailwind.config.ts
├── tsconfig.json
├── playwright.config.ts
├── next.config.js
└── package.json
```

---

## Conventions

**Naming:** Route folders → lowercase kebab (`scorecard/page.tsx`). Component files → PascalCase (`RoutineItem.tsx`). Hooks → camelCase with `use` (`useRoutines.ts`). Lib/util files → kebab-case (`growth-math.ts`). Functions → camelCase. Constants → UPPER_SNAKE_CASE. Types → PascalCase. DB columns → snake_case. Migrations → timestamp_snake_case.

**TypeScript:** Strict mode, never `any`. Export types from `types/`. Prefer `interface` for objects, `type` for unions. Always type params and returns on exports.

**React:** Functional components only. Named exports (default only for `page.tsx`). One responsibility per component. Extract to hooks at ~80 lines. Props interface: `{ComponentName}Props`, destructured in signature.

**State:** React hooks for local state. Supabase real-time for synced data. No Redux/Zustand. Lift to nearest common parent.

**Styling:** Tailwind utilities in JSX only. `@apply` in `globals.css` only if 3+ uses. No inline styles, no hardcoded colors. Mobile-first (375px base). `sm:` 640px, `md:` 768px, `lg:` 1024px. Touch targets min 44×44px.

**Errors:** Try/catch on Supabase calls. User-friendly toast/inline messages. `error.tsx` boundaries for pages.

**Do:** semantic HTML, `aria-label` on icon buttons, loading states, `<Link>` for nav, `next/image`, validate with Zod, descriptive names.

**Don't:** use `any`, install unapproved deps, create API routes for CRUD, put logic in components, use `useEffect` for fetching, suppress TS/ESLint errors, commit `.env.local`.

---

## Design Tokens

Positive → `text-green-500` / `bg-green-500`. Negative → `text-red-500` / `bg-red-500`. Neutral → `text-gray-400` / `bg-gray-400`. Primary → `text-indigo-500` / `bg-indigo-500`. Background → `bg-white`. Surface → `bg-gray-50`. Text primary → `text-gray-900`. Text secondary → `text-gray-500`. Border → `border-gray-200`.

**UI Quality:**

- **Typography:** Use intentional, distinctive font pairings — pair a display font with a refined body font. Never default to generic choices (Inter, Roboto, Arial, system fonts).
- **Color commitment:** Lean into the token palette with confidence. Dominant colors with sharp accents — don't spread colors timidly or evenly.
- **Micro-interactions:** Subtle CSS animations for check-in toggles, vote count increments, and stack connections. Prefer CSS-only solutions; use Motion library for React when complexity requires it. One well-orchestrated page load with staggered reveals beats scattered micro-interactions.
- **Anti-generic:** Avoid cookie-cutter AI aesthetics — no purple gradients on white, no predictable card grids, no design that lacks context-specific character. Every screen should feel intentionally designed for Forge's purpose.

---

## Data Model

**Conventions:** Every table has uuid PK (`id`). User-owned tables have `user_id` for RLS. Timestamps use `timestamptz DEFAULT now()`. Use `text` with check constraints (not Postgres enums). Soft-delete via `archived_at timestamptz` for routines and identities — filter `WHERE archived_at IS NULL`.

**profiles:** `id` uuid PK (→ auth.users), `display_name` text, `onboarding_complete` bool (default false), `created_at`, `updated_at`.

**routines:** `id` uuid PK, `user_id` uuid FK, `name` text, `tag` text (check: positive/negative/neutral), `time_of_day` text nullable (check: morning/afternoon/evening/night), `sort_order` int, `archived_at` timestamptz nullable, `created_at`, `updated_at`.

**check_ins:** `id` uuid PK, `user_id` uuid FK, `routine_id` uuid FK, `date` date, `completed` bool (default false), `created_at`, `updated_at`. **Unique:** `(routine_id, date)`.

**habit_stacks:** `id` uuid PK, `user_id` uuid FK, `anchor_routine_id` uuid FK, `stacked_routine_id` uuid FK, `position` int, `created_at`.

**identities:** `id` uuid PK, `user_id` uuid FK, `statement` text, `archived_at` timestamptz nullable, `created_at`, `updated_at`.

**identity_habits:** `id` uuid PK, `identity_id` uuid FK, `routine_id` uuid FK, `user_id` uuid FK (denormalized for RLS).

> **Votes are computed:** join `check_ins` with `identity_habits` on `routine_id` where `completed = true`.

---

## Sprint 1

**Abhishek:** Auth, Supabase schema, Scorecard, Onboarding. **Derek:** Stacking, Identity Voting, Nav/Layout.

- **US-1:** Scorecard — add/edit/delete routines with name, tag, optional time of day. Dashboard shows +/−/= breakdown.
- **US-2:** Daily check-in — today's routines as checklist, mark done/not done, date-stamped, past days, completion rate.
- **US-3:** Habit stacking — anchor + stacked ("After X, I will Y"), chains of 2+, visible in check-in, editable.
- **US-4:** Visual stacks — vertical chain diagram, tag colors, completed distinguished, mobile-friendly.
- **US-5:** Identity statements — create/edit/delete, link to habits, display on dashboard.
- **US-6:** Vote counter — completed linked habit = vote, progress bar, daily/weekly history.
- **US-7:** Auth — email/password + Google OAuth (with `/callback`), protected routes, logout, session persistence.
- **US-8:** Onboarding — 2–3 steps, add 3 routines + tags, skippable, standalone `/onboarding` route.

**Sprint 2:** Four Laws Audit, Compound Visualizer, Accountability Partners, Progressive Disclosure.

---

## Testing, CI/CD & Git

**Tests:** Vitest + RTL (unit, co-located). Playwright (E2E in `e2e/`). 70%+ coverage on hooks/utils. E2E specs verify user story acceptance criteria.

**Code Quality:** ESLint (`eslint-config-next`) + Prettier (`prettier-plugin-tailwindcss`). Run `npm run lint` and `npm run format:check` before every commit. No warnings or errors allowed in CI.

**CI/CD (GitHub Actions):** Pipeline on every PR and `main` push:
1. **Lint** — ESLint + Prettier check + TypeScript compile (`tsc --noEmit`)
2. **Test** — Vitest (unit) + Playwright (E2E), coverage report uploaded
3. **Build** — `next build` must pass with zero errors
4. **Deploy** — Vercel auto-deploys: preview on PR, production on `main` merge

**Security:** Run `npm audit` in CI. Fix critical/high vulnerabilities before merge.
**Branches:** `<type>/<issue>-<desc>` from `main`. Types: `feature/`, `fix/`, `chore/`, `docs/`.

**Commits:** `<type>: <description> #<issue>`. Present tense, under 72 chars. Dep changes committed separately.

**PRs:** Squash merge. Teammate review required. Screenshots for UI changes. `Closes #X` in body.

**Done:** Acceptance criteria met, conventions followed, works at 375px, no errors, PR approved.