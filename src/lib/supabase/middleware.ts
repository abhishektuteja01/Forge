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
  const isPublicRoute =
    url.pathname === "/" ||
    url.pathname.startsWith("/login") ||
    url.pathname.startsWith("/signup") ||
    url.pathname.startsWith("/callback") ||
    url.pathname.startsWith("/onboarding");

  // Redirect unauthenticated users away from protected routes
  if (!user && !isPublicRoute) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Optional: if a signed-in user hits /login or /signup, redirect them to dashboard
  if (user && (url.pathname.startsWith("/login") || url.pathname.startsWith("/signup"))) {
    // Assuming /scorecard is the main authenticated entry layout. You'll likely adjust this
    // once we build the layout.
    url.pathname = "/scorecard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
