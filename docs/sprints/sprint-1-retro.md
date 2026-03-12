# Sprint 1 Retrospective

**Sprint Duration:** March 3 to March 9, 2026
**Review Date:** March 11, 2026

## What Got Done

**Abhishek:**
- Project scaffolding with Next.js 14, React 18, Tailwind CSS, Supabase
- Full database migration: all 6 tables, RLS policies, triggers for auto profile creation and updated_at timestamps
- Supabase client setup (browser, server, middleware)
- TypeScript types for all tables with Row/Insert/Update variants
- Zod validators for routines, identities, and stacks
- CI/CD pipeline with format check, lint, type check, and build steps
- Shared UI components: Button (4 variants, loading state), Card, Input (with labels and errors), Modal (portal based, bottom sheet on mobile)
- Dashboard layout with desktop sidebar and mobile bottom nav
- Auth layout (centered card with Forge branding)
- Landing page with hero section and "The Mechanics" feature overview
- Root middleware protecting dashboard routes
- Auth pages: in progress at sprint end, not merged yet

**Derek:**
- Scorecard screen: useRoutines hook (CRUD with soft delete), useCheckIns hook (toggle with optimistic UI), ScorecardSummary component (progress bar + tag breakdown), RoutineItem (checkbox + tag badge + menu), RoutineGroup (time of day sections), AddRoutineForm (name + tag picker + time picker), DateNavigator (timezone safe date switching), full page wiring
- Stacks screen: useStacks hook (parallel fetch, chain grouping by anchor, auto position), StackCard component (anchor/connector/stacked visual matching mockup), StackBuilder (two step form with pick existing or create new, live preview), full page with new routine orchestration
- Identity screen: useIdentities hook (four table parallel fetch, vote computation from check_ins joined with identity_habits, weekly history), VoteCounter (total + today badge + 7 day mini bar chart), IdentityCard (statement + weekly progress bar + vote counter + linked routine chips), IdentityForm (three modes: create/edit/links with multi select routine picker), full page with single modal three mode pattern

## What Went Well

**The work split worked.** Abhishek owned the foundation layer (schema, auth, scaffolding) and Derek owned the feature screens (scorecard, stacks, identity). We touched completely different files for most of the sprint, which meant zero merge conflicts.

**Building with mock data fallbacks.** Since auth wasn't ready yet, we made the hooks gracefully fall back to empty state when Supabase couldn't connect. This let us build and visually verify all three screens without being blocked on auth. Once the key lands, everything just connects.

**The AGENTS.md rules file paid off.** Having conventions, folder structure, naming, and the data model documented upfront meant the AI coding tools generated code that matched the project architecture on the first try. No wrong table names, no incorrect auth patterns, no random folder structures.

**Consistent component patterns.** Every screen follows the same structure: hook for data, small composable components, page file that wires them together, modal for create/edit forms. Makes it easy to build the next screen once you've done one.

## What Could Have Gone Better

**Auth took longer than expected.** We planned for it to be done mid sprint so Derek could test real data flows. It's still in progress at sprint end, which means all three feature screens are built but untested against live Supabase data.

**No tests written yet.** We prioritized getting the UI built and deferred testing. This is a risk going into Sprint 2 since we need 80%+ coverage for the rubric. Tests for hooks and components need to happen early in Sprint 2.

**The Supabase anon key issue.** Abhishek initially sent the wrong format for the API key which cost some debugging time. Small thing but a reminder to verify environment setup before sharing credentials.

## What We'll Change for Sprint 2

- Get auth merged to main first thing so both teammates can test against real data
- Start writing tests alongside features instead of deferring them
- Do a mobile responsiveness pass on all three screens before building new features
- Set up Vercel deployment early so we have a live preview URL for the professor

## Velocity

Planned: 8 user stories
Completed: 6 (US-1 through US-6 UI complete, pending auth integration)
In Progress: 2 (US-7 auth, US-8 onboarding)
Blocked: 0

The feature code is done but can't be fully verified until auth is merged. This is a known tradeoff we made to keep building instead of waiting.
