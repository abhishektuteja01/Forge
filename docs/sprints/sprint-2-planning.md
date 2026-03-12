# Sprint 2 Planning

**Sprint Duration:** March 10 to March 16, 2026
**Sprint Goal:** Ship Sprint 2 features (Four Laws Audit, Compound Growth Visualizer, Accountability Partners, Progressive Disclosure), achieve 80%+ test coverage, deploy to production, and complete all deliverables.

## Carry Over from Sprint 1

Auth (US-7) and Onboarding (US-8) are still in progress. These must be merged to main at the start of Sprint 2 before any other work begins. All Sprint 1 feature screens (Scorecard, Stacks, Identity) are built but need integration testing once auth is live.

## User Stories

### US-9: Four Laws Audit (Abhishek, P1)
As a user, I want to audit a struggling habit against the Four Laws (Obvious, Attractive, Easy, Satisfying) and receive specific suggestions so I can diagnose why a habit isn't sticking.

Acceptance criteria:
- User can select a habit and initiate an audit
- Audit presents four questions (one per law) with rating scales
- Based on ratings, the system generates rule based suggestions
- Suggestions are stored and viewable later
- Audit results are visually displayed (radar chart or scorecard per law)

### US-10: Compound Growth Visualizer (Abhishek, P1)
As a user, I want to see a compound growth visualization showing projected trajectories for 1% better vs 1% worse so I can see the long term impact of small daily efforts.

Acceptance criteria:
- Interactive chart showing three lines: current trajectory, 1% daily improvement, 1% daily decline
- Chart uses the user's actual consistency data as the starting point
- User can adjust the time horizon (30 days, 90 days, 1 year)
- Hover/tap interactions show specific projected values
- Chart is responsive and works well on mobile

### US-11: Accountability Partners (Derek, P2)
As a user, I want to invite an accountability partner who can view my streaks and habit stacks so I have external motivation on tough days.

Acceptance criteria:
- User can generate an invite link or search by email
- Partner can view (read only) the user's scorecard, stacks, and streaks
- Partner can send a nudge (notification or in app message)
- User can remove a partner at any time
- Async model, partner sees latest snapshot not real time updates

### US-12: Progressive Disclosure (Abhishek, P2)
As a user, I want the app to progressively unlock features as I build my habit practice so I'm not overwhelmed on day one.

Acceptance criteria:
- New users start with only the Scorecard feature visible
- Habit Stacking unlocks after user has logged 3+ routines
- Identity Voting unlocks after user has completed 7 days of check ins
- Four Laws Audit unlocks after user tags a habit as struggling
- Unlocked features are introduced with a brief tooltip or modal explanation
- Advanced users can manually unlock all features in settings

## Non Feature Work

This is critical for the rubric and carries significant weight.

### Testing (60 pts at stake for Technical Excellence)
- Unit tests for all hooks (useRoutines, useCheckIns, useStacks, useIdentities) using Vitest
- Component tests for key UI components using React Testing Library
- E2E tests for the main user flows using Playwright
- Target: 80%+ coverage on hooks and utility functions
- Coverage reporting integrated into CI pipeline

### CI/CD Improvements (30 pts at stake)
- Uncomment and enable Vitest and Playwright steps in ci.yml
- Add coverage upload and reporting
- Set up Vercel deploy previews on PRs
- Add security scanning (npm audit check already exists, add more)
- Multi stage pipeline verification

### Documentation (15 pts at stake)
- Comprehensive README with setup instructions, architecture overview, screenshots
- API documentation for the data model and Supabase endpoints
- 1500 word technical blog post
- 10 minute demo video

### AI Modality Log (30 pts for AI Mastery)
- Document usage of Claude Web for planning, architecture decisions, code review
- Document usage of Antigravity IDE for code generation, scaffolding, feature implementation
- Include specific examples with before/after showing impact of AI tools

## Sprint Backlog

| Task | Owner | Priority | Estimate |
|---|---|---|---|
| Merge auth + onboarding to main | Abhishek | P0 | Day 1 |
| Integration test Sprint 1 features against live data | Both | P0 | 2 hr |
| Mobile responsiveness pass on all screens | Derek | P0 | 1.5 hr |
| Four Laws Audit: UI + suggestion engine | Abhishek | P1 | 3 hr |
| Compound Growth Visualizer (recharts) | Abhishek | P1 | 2.5 hr |
| Accountability Partners: invite + shared view + nudge | Derek | P2 | 3 hr |
| Progressive Disclosure: unlock logic + tooltips | Abhishek | P2 | 2 hr |
| Unit tests for all hooks | Derek | P0 | 3 hr |
| Component tests for key components | Derek | P0 | 2 hr |
| E2E tests for main user flows | Abhishek | P0 | 2 hr |
| CI/CD: enable tests, coverage, deploy previews | Abhishek | P0 | 1 hr |
| README + API docs | Derek | P1 | 1.5 hr |
| Blog post draft | Derek | P1 | 2 hr |
| Demo video | Both | P1 | 1 hr |
| AI modality log | Both | P1 | 1 hr |
| Vercel production deployment | Abhishek | P0 | 0.5 hr |
| Bug fixes and polish | Both | P0 | 2 hr |

## Risks

1. **Auth still not merged.** If auth doesn't land by day 1, all Sprint 2 features and testing are blocked. Mitigation: this is the #1 priority.
2. **Test coverage target is aggressive.** 80%+ means thorough testing of hooks, components, and user flows. Mitigation: start testing immediately after auth merge, focus on hooks first since they carry the most logic.
3. **Time pressure on deliverables.** Blog post, demo video, and documentation all need to happen in the same sprint as features and testing. Mitigation: write docs as we go, not at the end.

## Definition of Done

Same as Sprint 1, plus:
- 80%+ test coverage on hooks and utilities
- All tests pass in CI
- App deployed to Vercel production URL
- All documentation deliverables complete
