# Sprint 1 Planning

**Sprint Duration:** March 3 to March 9, 2026
**Sprint Goal:** Build the core habit tracking loop so users can sign up, create a scorecard, build habit stacks, and track identity votes.

## Team

Abhishek Tuteja: Auth, Supabase schema, Scorecard, Onboarding
Derek Zhang: Habit Stacking, Identity Voting, Navigation/Layout

## User Stories

### US-1: Habits Scorecard (Abhishek, P0)

As a user, I want to list my daily routines and tag each as positive, negative, or neutral so I can see how much of my day is working for or against me.

Acceptance criteria:

- User can add a new routine with a name and optional time of day
- User can tag each routine as positive, negative, or neutral
- User can edit or delete existing routines
- Dashboard displays a summary count/percentage of positive vs negative vs neutral habits
- Routines persist across sessions (stored in Supabase)
- Mobile responsive layout

### US-2: Daily Check In (Abhishek, P0)

As a user, I want to check off which routines I completed today so I can track my consistency over time.

Acceptance criteria:

- User sees today's routines as a checklist
- User can mark each routine as done/not done for the current day
- Completion data is stored per day (date stamped)
- User can view past days' check ins
- Visual indicator for today's completion rate

### US-3: Habit Stacking (Derek, P0)

As a user, I want to create habit stacks by linking a new habit to an existing one so new habits have a natural trigger.

Acceptance criteria:

- User can select an existing routine as the anchor habit
- User can define a new habit to stack on top of the anchor
- The stack is displayed as a linked pair: "After X, I will Y"
- User can create chains of 2+ stacked habits
- Stacks are visible on the daily check in view
- User can edit or break apart existing stacks

### US-4: Visual Stack View (Derek, P0)

As a user, I want to see my habit stacks displayed as a visual chain so I can understand the flow of my routine at a glance.

Acceptance criteria:

- Habit stacks render as a vertical chain/flow diagram
- Each node shows the habit name and its positive/negative/neutral tag
- Completed habits in a stack are visually distinguished
- Mobile friendly layout

### US-5: Identity Statements (Derek, P1)

As a user, I want to define an identity statement so I can orient my habits around who I want to become.

Acceptance criteria:

- User can create one or more identity statements
- Each identity can be linked to one or more habits
- User can edit or delete identity statements
- Identities are displayed prominently on the identity page

### US-6: Vote Counter (Derek, P1)

As a user, I want to see each habit completion counted as a vote toward my identity so I stay motivated by who I'm becoming.

Acceptance criteria:

- Each time a linked habit is completed, the identity's vote count increments
- Identity card shows total votes and a progress indicator
- Visual representation of voting momentum (progress bar, weekly breakdown)
- User can see vote history over time (daily/weekly)

### US-7: User Authentication (Abhishek, P0)

As a user, I want to sign up and log in securely so my habit data is private and persistent.

Acceptance criteria:

- User can sign up with email and password
- User can sign up / log in with Google OAuth
- Authenticated routes are protected (redirect to login if not signed in)
- User can log out
- Session persists across browser refreshes

### US-8: Onboarding Flow (Abhishek, P0)

As a new user, I want to be guided through setting up my first scorecard so I'm not dropped into an empty app with no direction.

Acceptance criteria:

- First time users see a brief onboarding flow (2 to 3 steps max)
- Onboarding prompts user to add at least 3 daily routines
- Onboarding prompts user to tag each routine
- After onboarding, user lands on their populated dashboard
- Onboarding can be skipped

## Technical Decisions

**Stack:** Next.js 14 (App Router), React 18, Tailwind CSS, Supabase (PostgreSQL + Auth), TypeScript strict mode.

**Architecture:** Server Components by default, Client Components only for interactive UI. Supabase Row Level Security for data isolation instead of custom API routes. Zod for input validation on client and server.

**Database:** Single migration with all 6 tables (profiles, routines, check_ins, habit_stacks, identities, identity_habits). RLS policies on every table. Soft delete via archived_at for routines and identities. Votes are computed from check_ins joined with identity_habits, never stored.

**Work split strategy:** Each person owns distinct feature folders and component directories to minimize merge conflicts. Shared UI primitives built first, then features independently.

## Sprint Backlog

| Task                                                | Owner    | Priority | Estimate |
| --------------------------------------------------- | -------- | -------- | -------- |
| Project scaffolding (Next.js + Supabase + Tailwind) | Abhishek | P0       | 1 hr     |
| Database schema + RLS policies + migration          | Abhishek | P0       | 2 hr     |
| TypeScript types, Zod validators, Supabase clients  | Abhishek | P0       | 1 hr     |
| CI/CD pipeline (lint, type check, build)            | Abhishek | P0       | 1 hr     |
| Shared UI components (Button, Card, Modal, Input)   | Abhishek | P0       | 1 hr     |
| Auth pages (login, signup, OAuth callback)          | Abhishek | P0       | 3 hr     |
| Onboarding flow                                     | Abhishek | P0       | 2 hr     |
| Scorecard: routine CRUD + daily check in            | Abhishek | P0       | 3 hr     |
| Dashboard layout + mobile nav + header              | Derek    | P0       | 1.5 hr   |
| Habit Stacking: hook, card, builder, page           | Derek    | P0       | 3 hr     |
| Visual stack chain rendering                        | Derek    | P0       | 1 hr     |
| Identity: hook, card, form, vote counter, page      | Derek    | P1       | 3 hr     |
| Landing page                                        | Abhishek | P0       | 1 hr     |

## Definition of Done

- Acceptance criteria met for each user story
- Code follows AGENTS.md conventions (naming, typing, no `any`, mobile first)
- Works at 375px viewport width
- No TypeScript or ESLint errors
- PR reviewed by teammate before merge
