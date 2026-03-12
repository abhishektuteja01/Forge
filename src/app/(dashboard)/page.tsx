import { redirect } from "next/navigation";

export default function DashboardHome() {
  // PRD specifies the Scorecard is the primary view constraint for Day 1
  redirect("/scorecard");
}
