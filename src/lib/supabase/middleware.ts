import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session and get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();

  // Define public routes based on PRD requirements
  // Note: /onboarding is removed from here so we can protect it via auth checks
  const isPublicRoute =
    url.pathname === "/" ||
    url.pathname.startsWith("/login") ||
    url.pathname.startsWith("/signup") ||
    url.pathname.startsWith("/callback");

  // Internal helper to preserve Supabase auth cookies during Next.js redirects
  const redirectWithCookies = (redirectUrl: URL) => {
    const redirectRes = NextResponse.redirect(redirectUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectRes.cookies.set(cookie.name, cookie.value);
    });
    return redirectRes;
  };

  // Redirect unauthenticated users away from protected routes (which now includes /onboarding)
  if (!user && !isPublicRoute) {
    url.pathname = "/login";
    return redirectWithCookies(url);
  }

  if (user && !url.pathname.startsWith("/callback")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_complete")
      .eq("id", user.id)
      .single();

    const isOnboardingComplete = profile?.onboarding_complete ?? false;
    const isOnboardingRoute = url.pathname.startsWith("/onboarding");
    const isAuthOrRootRoute =
      url.pathname === "/" ||
      url.pathname.startsWith("/login") ||
      url.pathname.startsWith("/signup");

    console.log(
      `[Middleware Check] Path: ${url.pathname} | Onboarded: ${isOnboardingComplete}`
    );

    if (!isOnboardingComplete) {
      if (!isOnboardingRoute) {
        url.pathname = "/onboarding";
        return redirectWithCookies(url);
      }
    } else {
      if (isOnboardingRoute || isAuthOrRootRoute) {
        url.pathname = "/scorecard";
        return redirectWithCookies(url);
      }
    }
  }

  return supabaseResponse;
}
