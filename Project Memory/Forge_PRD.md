# Forge — Product Requirements Document (PRD)

**Version:** 1.0
**Date:** February 26, 2026
**Team:** Abhishek Tuteja, Derek Zhang
**Repository:** _(insert GitHub repo link)_

---

## 1. Product Overview

**Forge** is a mobile-first habit-building web application based on the proven frameworks from _Atomic Habits_ by James Clear. Instead of being another checkbox tracker, Forge implements the book's actual systems — the Habits Scorecard, Habit Stacking, Identity-Based Voting, the Four Laws of Behavior Change, and a Compound Growth Visualizer.

The app uses progressive disclosure to avoid overwhelming users: new users start by simply mapping their daily routines with the Scorecard, and features unlock naturally as they progress. All insights are generated through rule-based logic and statistical patterns from the user's own data — no AI required.

**Core thesis:** Most habit apps track _what_ you do. Forge helps you understand _why_ habits stick or fail and _who_ you're becoming through them.

---

## 2. Target Users

### Persona 1: College Student

- **Profile:** 18–24, trying to build consistent study routines, exercise habits, or break bad habits like late-night scrolling
- **Pain point:** Has read or heard about Atomic Habits but has no structured way to apply its principles
- **Goal:** A system that makes habit-building feel manageable, not overwhelming
- **Device:** Primarily mobile (phone browser)

### Persona 2: Young Professional

- **Profile:** 22–30, navigating new responsibilities (first job, living alone, managing health)
- **Pain point:** Has tried habit trackers before but abandoned them within two weeks because streak counters aren't motivating enough
- **Goal:** Sustainable self-improvement with a system that explains _why_ things work, not just _whether_ they happened
- **Device:** Mobile-first, occasional desktop use

---

## 3. User Stories & Acceptance Criteria

### Sprint 1 Stories

#### US-1: Habits Scorecard — List and Tag Daily Routines

**Owner:** Abhishek
**As a** user, **I want to** list my daily routines and tag each as positive (+), negative (−), or neutral (=), **so that** I can see how much of my day is working for or against me.

**Acceptance Criteria:**

- [ ] User can add a new routine with a name and optional time of day
- [ ] User can tag each routine as positive, negative, or neutral
- [ ] User can edit or delete existing routines
- [ ] Dashboard displays a summary count/percentage of positive vs. negative vs. neutral habits
- [ ] Routines persist across sessions (stored in Supabase)
- [ ] Mobile-responsive layout

#### US-2: Habits Scorecard — Daily Check-In

**Owner:** Abhishek
**As a** user, **I want to** check off which routines I completed today, **so that** I can track my consistency over time.

**Acceptance Criteria:**

- [ ] User sees today's routines as a checklist
- [ ] User can mark each routine as done/not done for the current day
- [ ] Completion data is stored per day (date-stamped)
- [ ] User can view past days' check-ins
- [ ] Visual indicator for today's completion rate

#### US-3: Habit Stacking — Create Linked Habit Pairs

**Owner:** Derek
**As a** user, **I want to** create habit stacks by linking a new habit to an existing one ("After I [CURRENT HABIT], I will [NEW HABIT]"), **so that** new habits have a natural trigger.

**Acceptance Criteria:**

- [ ] User can select an existing routine as the "anchor" habit
- [ ] User can define a new habit to stack on top of the anchor
- [ ] The stack is displayed as a linked pair: "After X, I will Y"
- [ ] User can create chains of 2+ stacked habits
- [ ] Stacks are visible on the daily check-in view
- [ ] User can edit or break apart existing stacks

#### US-4: Habit Stacking — Visual Stack View

**Owner:** Derek
**As a** user, **I want to** see my habit stacks displayed as a visual chain, **so that** I can understand the flow of my routine at a glance.

**Acceptance Criteria:**

- [ ] Habit stacks render as a vertical or horizontal chain/flow diagram
- [ ] Each node shows the habit name and its positive/negative/neutral tag
- [ ] Completed habits in a stack are visually distinguished (e.g., checked, highlighted)
- [ ] Mobile-friendly layout (vertical stack on small screens)

#### US-5: Identity Voting — Define Identity Statements

**Owner:** Derek
**As a** user, **I want to** define an identity statement (e.g., "I am someone who reads daily"), **so that** I can orient my habits around who I want to become.

**Acceptance Criteria:**

- [ ] User can create one or more identity statements
- [ ] Each identity can be linked to one or more habits
- [ ] User can edit or delete identity statements
- [ ] Identities are displayed prominently (e.g., profile section or dashboard header)

#### US-6: Identity Voting — Vote Counter and Progress

**Owner:** Derek
**As a** user, **I want to** see each habit completion counted as a "vote" toward my identity, **so that** I stay motivated by who I'm becoming rather than just what I'm doing.

**Acceptance Criteria:**

- [ ] Each time a linked habit is completed, the identity's vote count increments
- [ ] Identity card shows total votes and a progress indicator
- [ ] Visual representation of voting momentum (e.g., progress bar, tally marks, or percentage)
- [ ] User can see vote history over time (daily/weekly breakdown)

#### US-7: User Authentication

**Owner:** Abhishek
**As a** user, **I want to** sign up and log in securely, **so that** my habit data is private and persistent.

**Acceptance Criteria:**

- [ ] User can sign up with email and password
- [ ] User can sign up / log in with Google OAuth
- [ ] User sees appropriate error messages for invalid inputs
- [ ] Authenticated routes are protected (redirect to login if not signed in)
- [ ] User can log out
- [ ] Session persists across browser refreshes (Supabase auth session)

#### US-8: Onboarding Flow

**Owner:** Abhishek
**As a** new user, **I want to** be guided through setting up my first scorecard, **so that** I'm not dropped into an empty app with no direction.

**Acceptance Criteria:**

- [ ] First-time users see a brief onboarding flow (2–3 steps max)
- [ ] Onboarding prompts user to add at least 3 daily routines
- [ ] Onboarding prompts user to tag each routine
- [ ] After onboarding, user lands on their populated dashboard
- [ ] Onboarding can be skipped

---

### Sprint 2 Stories

#### US-9: Four Laws Audit

**Owner:** Abhishek
**As a** user, **I want to** audit a struggling habit against the Four Laws (Obvious, Attractive, Easy, Satisfying) and receive specific suggestions, **so that** I can diagnose why a habit isn't sticking.

**Acceptance Criteria:**

- [ ] User can select a habit and initiate an audit
- [ ] Audit presents four questions (one per law) with rating scales
- [ ] Based on ratings, the system generates rule-based suggestions (e.g., "Make it easier: reduce from 30 min to 5 min")
- [ ] Suggestions are stored and viewable later
- [ ] Audit results are visually displayed (e.g., radar chart or scorecard per law)

#### US-10: Compound Growth Visualizer

**Owner:** Abhishek
**As a** user, **I want to** see a compound growth visualization showing projected trajectories for 1% better vs. 1% worse, **so that** I can see the long-term impact of small daily efforts.

**Acceptance Criteria:**

- [ ] Interactive chart showing three lines: current trajectory, 1% daily improvement, 1% daily decline
- [ ] Chart uses the user's actual consistency data as the starting point
- [ ] User can adjust the time horizon (30 days, 90 days, 1 year)
- [ ] Hover/tap interactions show specific projected values
- [ ] Chart is responsive and works well on mobile

#### US-11: Accountability Partners — Invite and Shared View

**Owner:** Derek
**As a** user, **I want to** invite an accountability partner who can view my streaks and habit stacks, **so that** I have external motivation on tough days.

**Acceptance Criteria:**

- [ ] User can generate an invite link or search by email
- [ ] Partner can view (read-only) the user's scorecard, stacks, and streaks
- [ ] Partner can send a "nudge" (notification or in-app message)
- [ ] User can remove a partner at any time
- [ ] Async model — partner sees latest snapshot, not real-time updates

#### US-12: Progressive Disclosure — Feature Unlocking

**Owner:** Abhishek
**As a** user, **I want** the app to progressively unlock features as I build my habit practice, **so that** I'm not overwhelmed on day one.

**Acceptance Criteria:**

- [ ] New users start with only the Scorecard feature visible
- [ ] Habit Stacking unlocks after user has logged 3+ routines
- [ ] Identity Voting unlocks after user has completed 7 days of check-ins
- [ ] Four Laws Audit unlocks after user tags a habit as "struggling"
- [ ] Unlocked features are introduced with a brief tooltip or modal explanation
- [ ] Advanced users can manually unlock all features in settings

---

## 4. Feature Priority Matrix

| Feature                                      | Sprint | Priority          | Owner    |
| -------------------------------------------- | ------ | ----------------- | -------- |
| User Authentication (email + Google OAuth)   | 1      | P0 — Must Have    | Abhishek |
| Onboarding Flow                              | 1      | P0 — Must Have    | Abhishek |
| Habits Scorecard (list, tag, daily check-in) | 1      | P0 — Must Have    | Abhishek |
| Habit Stacking (create + visual view)        | 1      | P0 — Must Have    | Derek    |
| Identity Voting (statements + vote counter)  | 1      | P1 — Should Have  | Derek    |
| Four Laws Audit                              | 2      | P1 — Should Have  | Abhishek |
| Compound Growth Visualizer                   | 2      | P1 — Should Have  | Abhishek |
| Accountability Partners (async)              | 2      | P2 — Nice to Have | Derek    |
| Progressive Disclosure                       | 2      | P2 — Nice to Have | Abhishek |

---

## 5. Technical Architecture

### Tech Stack

- **Frontend:** React 18 + Next.js 14 (App Router)
- **Styling:** Tailwind CSS (mobile-first utility classes)
- **Backend/Database:** Supabase (PostgreSQL + Auth + Realtime)
- **Auth:** Supabase Auth (email/password + Google OAuth)
- **Hosting:** Vercel
- **Package Manager:** npm

### Project Structure

```
forge/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/             # Auth route group
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── callback/route.ts         # Google OAuth callback
│   │   ├── (dashboard)/        # Protected route group
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                  # Dashboard home
│   │   │   ├── scorecard/page.tsx
│   │   │   ├── stacks/page.tsx
│   │   │   ├── identity/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── onboarding/page.tsx           # Standalone, no dashboard nav
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── ui/                 # Reusable UI primitives (Button, Card, Modal, etc.)
│   │   ├── scorecard/          # Scorecard-specific components (Owner: Abhishek)
│   │   ├── stacks/             # Stacking-specific components (Owner: Derek)
│   │   ├── identity/           # Identity-specific components (Owner: Derek)
│   │   ├── onboarding/         # Onboarding-specific components (Owner: Abhishek)
│   │   └── layout/             # Navigation, sidebar, header (Owner: Derek)
│   ├── hooks/                  # Custom React hooks
│   │   ├── useRoutines.ts      # Abhishek
│   │   ├── useCheckIns.ts      # Abhishek
│   │   ├── useAuth.ts          # Abhishek
│   │   ├── useStacks.ts        # Derek
│   │   ├── useIdentities.ts    # Derek
│   │   └── useFeatureFlags.ts
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts       # Supabase browser client
│   │   │   ├── server.ts       # Supabase server client
│   │   │   └── middleware.ts   # Auth middleware helper
│   │   ├── validators/         # Zod schemas (routine.ts, identity.ts, stack.ts)
│   │   ├── utils.ts            # General utility functions
│   │   └── constants.ts        # App-wide constants
│   ├── types/                  # TypeScript type definitions
│   │   ├── database.ts         # Auto-generated Supabase types
│   │   ├── auth.ts             # Abhishek
│   │   ├── scorecard.ts        # Abhishek
│   │   ├── stacks.ts           # Derek
│   │   ├── identity.ts         # Derek
│   │   └── common.ts           # Shared enums (Tag, TimeOfDay)
│   └── styles/
│       └── globals.css         # Tailwind base + custom styles
├── supabase/
│   ├── migrations/             # Database migration files
│   ├── seed.sql                # Seed data for development
│   └── config.toml             # Supabase project config
├── e2e/                        # Playwright end-to-end tests
├── .github/
│   └── workflows/ci.yml       # CI/CD pipeline
├── middleware.ts               # Root Next.js middleware (delegates to lib/supabase/middleware.ts)
├── public/                     # Static assets
├── .env.local                  # Environment variables (not committed)
├── .env.example                # Template for environment variables
├── AGENTS.md                   # AI coding agent rules file
├── tailwind.config.ts
├── tsconfig.json
├── playwright.config.ts
├── next.config.js
└── package.json
```

### Key Architectural Decisions

- **App Router** over Pages Router for modern Next.js patterns (server components, layouts, route groups)
- **Server Components by default**, Client Components only where interactivity is needed (forms, charts, real-time UI)
- **Supabase Row-Level Security (RLS)** for data access control — no custom API layer needed. All CRUD operations go directly through the Supabase client (server client in Server Components, browser client in Client Components)
- **No API route handlers** for CRUD — RLS enforces user isolation at the database level
- **Zod validation** on all user input, both client-side and server-side, with schemas in `lib/validators/`
- **Mobile-first responsive design** — all layouts built for 375px+ screens first, then scaled up
- **TypeScript throughout** in strict mode for type safety

---

## 6. Data Model

### Conventions

- Every table has a uuid primary key (`id`)
- User-owned tables include `user_id` (uuid FK → profiles.id) for Row-Level Security
- Timestamps use `timestamptz` with `DEFAULT now()`
- Use `text` with check constraints instead of Postgres enums (easier to evolve)
- Soft-delete via `archived_at timestamptz` for routines and identities — always filter `WHERE archived_at IS NULL`

### Tables

#### `profiles`

| Column              | Type        | Notes                 |
| ------------------- | ----------- | --------------------- |
| id                  | uuid (PK)   | References auth.users |
| display_name        | text        | User's display name   |
| onboarding_complete | boolean     | Default false         |
| created_at          | timestamptz | Auto-generated        |
| updated_at          | timestamptz | Auto-generated        |

#### `routines`

| Column      | Type                   | Notes                                                        |
| ----------- | ---------------------- | ------------------------------------------------------------ |
| id          | uuid (PK)              | Auto-generated                                               |
| user_id     | uuid (FK)              | References profiles.id                                       |
| name        | text                   | Routine name                                                 |
| tag         | text                   | Check constraint: 'positive', 'negative', 'neutral'          |
| time_of_day | text (nullable)        | Check constraint: 'morning', 'afternoon', 'evening', 'night' |
| sort_order  | integer                | Display ordering                                             |
| archived_at | timestamptz (nullable) | Soft-delete timestamp; null = active                         |
| created_at  | timestamptz            | Auto-generated                                               |
| updated_at  | timestamptz            | Auto-generated                                               |

#### `check_ins`

| Column                | Type        | Notes                                                 |
| --------------------- | ----------- | ----------------------------------------------------- |
| id                    | uuid (PK)   | Auto-generated                                        |
| user_id               | uuid (FK)   | References profiles.id                                |
| routine_id            | uuid (FK)   | References routines.id                                |
| date                  | date        | The check-in date                                     |
| completed             | boolean     | Default false                                         |
| created_at            | timestamptz | Auto-generated                                        |
| updated_at            | timestamptz | Auto-generated                                        |
| **Unique constraint** |             | (routine_id, date) — one check-in per routine per day |

#### `habit_stacks`

| Column             | Type        | Notes                           |
| ------------------ | ----------- | ------------------------------- |
| id                 | uuid (PK)   | Auto-generated                  |
| user_id            | uuid (FK)   | References profiles.id          |
| anchor_routine_id  | uuid (FK)   | The existing "trigger" routine  |
| stacked_routine_id | uuid (FK)   | The new habit being stacked     |
| position           | integer     | Order within a multi-step chain |
| created_at         | timestamptz | Auto-generated                  |

#### `identities`

| Column      | Type                   | Notes                                |
| ----------- | ---------------------- | ------------------------------------ |
| id          | uuid (PK)              | Auto-generated                       |
| user_id     | uuid (FK)              | References profiles.id               |
| statement   | text                   | e.g., "I am someone who reads daily" |
| archived_at | timestamptz (nullable) | Soft-delete timestamp; null = active |
| created_at  | timestamptz            | Auto-generated                       |
| updated_at  | timestamptz            | Auto-generated                       |

#### `identity_habits`

| Column      | Type      | Notes                                               |
| ----------- | --------- | --------------------------------------------------- |
| id          | uuid (PK) | Auto-generated                                      |
| identity_id | uuid (FK) | References identities.id                            |
| routine_id  | uuid (FK) | References routines.id                              |
| user_id     | uuid (FK) | Denormalized from identity; required for RLS policy |

> **Note:** Identity "votes" are calculated, not stored. A vote = a completed check-in for any routine linked to that identity. Query `check_ins` joined with `identity_habits` to get vote counts.

---

## 7. Auth & Security

- **Supabase Auth** handles all authentication (email/password + Google OAuth)
- **Google OAuth callback** requires a dedicated route handler at `(auth)/callback/route.ts` to exchange the auth code for a session
- **Row-Level Security (RLS)** policies on all tables: users can only read/write their own data. Standard policy pattern:
  ```sql
  CREATE POLICY "Users access own data" ON table_name FOR ALL
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  ```
- **Auth middleware:** Root `middleware.ts` delegates to `lib/supabase/middleware.ts` to protect all `(dashboard)` routes — unauthenticated users redirect to `/login`
- **Environment variables** for Supabase URL and anon key stored in `.env.local`, never committed. **Never expose the `service_role` key client-side.**
- **HTTPS only** in production (handled by Vercel)

---

## 8. Design Principles

- **Mobile-first:** All designs start at 375px width. Desktop is a bonus, not the target.
- **Minimal and clean:** Generous whitespace, limited color palette, clear typography. No visual clutter.
- **Color system:** Use tag colors consistently throughout the app:
  - Positive habits → Green (#22C55E)
  - Negative habits → Red (#EF4444)
  - Neutral habits → Gray (#9CA3AF)
  - Primary accent → Indigo (#6366F1)
- **Progressive complexity:** The UI should feel simple on day one and grow with the user.
- **Micro-interactions:** Subtle animations for check-ins (checkbox fills), vote counting (number ticks up), and stack connections to make the app feel alive without being distracting.

---

## 9. Sprint Plan

### Sprint 1 (Week 1)

**Goal:** Core habit tracking loop is functional — users can sign up, build a scorecard, create stacks, and track identity votes.

| Task                                                | Owner    | Priority |
| --------------------------------------------------- | -------- | -------- |
| Project scaffolding (Next.js + Supabase + Tailwind) | Abhishek | P0       |
| Supabase schema + RLS policies                      | Abhishek | P0       |
| Auth (signup, login, logout, protected routes)      | Abhishek | P0       |
| Onboarding flow                                     | Abhishek | P0       |
| Scorecard: Add/edit/delete routines                 | Abhishek | P0       |
| Scorecard: Daily check-in view                      | Abhishek | P0       |
| Habit Stacking: Create linked pairs                 | Derek    | P0       |
| Habit Stacking: Visual chain view                   | Derek    | P0       |
| Identity: Create/edit statements                    | Derek    | P1       |
| Identity: Vote counter + progress                   | Derek    | P1       |
| Navigation + layout shell (mobile-first)            | Derek    | P0       |

### Sprint 2 (Week 2)

**Goal:** Advanced features — audit system, data visualization, social accountability, and progressive disclosure.

| Task                                           | Owner    | Priority |
| ---------------------------------------------- | -------- | -------- |
| Four Laws Audit: Audit UI + questionnaire      | Abhishek | P1       |
| Four Laws Audit: Rule-based suggestion engine  | Abhishek | P1       |
| Compound Growth Visualizer (interactive chart) | Abhishek | P1       |
| Accountability Partners: Invite flow           | Derek    | P2       |
| Accountability Partners: Shared view + nudges  | Derek    | P2       |
| Progressive Disclosure: Unlock system          | Abhishek | P2       |
| Bug fixes, polish, mobile testing              | Both     | P0       |

---

## 10. Testing, CI/CD & Git

### Testing Strategy

- **Unit tests:** Vitest + React Testing Library, co-located with source files. Target 70%+ coverage on hooks and utility functions.
- **End-to-end tests:** Playwright tests in `e2e/` directory. E2E specs verify user story acceptance criteria.

### Code Quality

- **Linting:** ESLint (`eslint-config-next`) + Prettier (`prettier-plugin-tailwindcss`). Run `npm run lint` and `npm run format:check` before every commit. Zero warnings or errors allowed in CI.

### CI/CD Pipeline (GitHub Actions)

Pipeline runs on every PR and `main` push:

1. **Lint** — ESLint + Prettier check + TypeScript compile (`tsc --noEmit`)
2. **Test** — Vitest (unit) + Playwright (E2E), coverage report uploaded
3. **Build** — `next build` must pass with zero errors
4. **Deploy** — Vercel auto-deploys: preview on PR, production on `main` merge

### Security

- Run `npm audit` in CI. Fix critical/high vulnerabilities before merge.

### Git Conventions

- **Branches:** `<type>/<issue>-<desc>` from `main`. Types: `feature/`, `fix/`, `chore/`, `docs/`.
- **Commits:** `<type>: <description> #<issue>`. Present tense, under 72 chars. Dependency changes committed separately.
- **PRs:** Squash merge. Teammate review required. Screenshots for UI changes. `Closes #X` in body.
- **Definition of Done:** Acceptance criteria met, conventions followed, works at 375px, no errors, PR approved.

---

## 11. Success Metrics

- User can complete the full habit tracking loop (sign up → add routines → check in → see progress) in under 3 minutes
- Scorecard loads in under 1 second on mobile
- Zero auth-related bugs in production
- All Sprint 1 features functional on mobile Chrome and Safari
- Habit stacks correctly reflect completion state in real time

---

## 12. Out of Scope (for now)

- Native mobile app (iOS/Android)
- AI-powered suggestions or insights
- Push notifications
- Data export (CSV, PDF)
- Public profiles or social features beyond accountability partners
- Habit categories or templates library
- Dark mode (can be added later via Tailwind)
