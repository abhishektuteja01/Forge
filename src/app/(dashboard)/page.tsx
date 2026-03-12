// Middleware redirects all traffic before this page renders:
// - Authenticated users → /scorecard
// - Unauthenticated users → /login
// This file exists only to satisfy Next.js build requirements for the (dashboard) route group.

export default function DashboardHome() {
  return <div />;
}
