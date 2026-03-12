import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();

    // Exchange the auth code directly with the deeply integrated Supabase Server client
    const { data: authData, error: authError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!authError && authData.user) {
      // Validate onboarding status strictly avoiding the explicit public schema
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_complete")
        .eq("id", authData.user.id)
        .single();

      if (!profile || !profile.onboarding_complete) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
      return NextResponse.redirect(new URL("/scorecard", request.url));
    }
  }

  // Fallback state if code is missing, expired, or generic failure
  return NextResponse.redirect(new URL("/login", request.url));
}
