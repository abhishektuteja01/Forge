import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function DashboardHome() {
  // PRD specifies the Scorecard is the primary view constraint for Day 1
  redirect("/scorecard");
}
