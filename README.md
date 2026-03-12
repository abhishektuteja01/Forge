<p align="center">
  <img src="docs/assets/logo.png" alt="Forge Logo" width="200" />
</p>

<h1 align="center">Forge</h1>

<p align="center">
  <strong>Refine your habits. Build your identity.</strong><br />
  A production-grade, mobile-first habit builder based on the behavioral science of <em>Atomic Habits</em>.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-Auth_%2B_RLS-emerald?logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Coverage-80.2%25_Branch-green" alt="Coverage" />
  <img src="https://img.shields.io/badge/License-MIT-gray" alt="License" />
</p>

---

## 🛠 Behavioral Infrastructure

Forge is not just a checklist; it's a behavioral feedback loop designed to facilitate identity-based transformation. By shifting the focus from **outcomes** to **identity**, Forge helps users bridge the gap between who they are and who they want to become.

### Core Capabilities

- **Identity-Based Voting**: Every completed habit acts as a "vote" for a specific identity. Watch your identity strengthen in real-time as you accumulate evidence of your new self.
- **Atomic Scorecard**: A comprehensive inventory of daily routines, categorized by impact (Positive, Negative, Neutral) to build the awareness necessary for change.
- **Habit Stacking Engines**: Programmatically link habits together using the "After [Anchor], I will [Stacked]" protocol, reducing the cognitive load of starting new routines.
- **Social Synchronization**: Real-time accountability through partner snapshots and "nudges," built on a secure, multi-user data isolation layer.

## 🏗 Engineering Excellence

Forge is built with a "Security-First, Quality-Always" philosophy. The architecture prioritizes data integrity and a seamless user experience.

### Technical Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router) with Server Components.
- **Data Layer**: [Supabase](https://supabase.com/) (PostgreSQL + Realtime).
- **Styling**: Tailwind CSS with a custom, premium design token system.
- **Validation**: Strict Zod schema validation for all client and server-side data flows.

### Production-Grade Quality

- **80%+ Branch Coverage**: Our test suite is designed for resilience, targeting the complex edge cases inherent in time-series habit data.
- **Advanced CI/CD**: A multi-stage pipeline featuring security audits (`npm audit`), static analysis (`ESLint`), and automated proof-of-correctness through Vitest.
- **Database Security**: Row-Level Security (RLS) policies configured at the database level to ensure absolute data isolation between users.
- **Optimistic UI**: Low-latency interactions using React state management for instant feedback on check-ins and votes.

## 🚀 Deployment & Operations

### Local Development

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/your-username/forge.git
    cd forge
    ```

2.  **Environment Configuration**:
    Create a `.env.local` file with your credentials:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    ```

3.  **Install & Run**:
    ```bash
    npm install
    npm run dev
    ```

### Continuous Integration

Our delivery pipeline ensures every commit is production-ready:

```bash
npm run lint           # Static Analysis
npm run type-check     # TypeScript Validation
npm run test:coverage  # High-Integrity Test Suite
npm run build          # Production Optimization
```

## 📜 Principles & Methodology

Forge follows the **Four Laws of Behavior Change**:

1. Make it Obvious (Scorecard)
2. Make it Attractive (Identity Progress)
3. Make it Easy (Habit Stacking)
4. Make it Satisfying (Real-time Votes)

---

<p align="center">
  Built for humans, engineered for reliability.
</p>
