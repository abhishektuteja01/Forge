"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validators/auth";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

// Prevent Next.js from attempting to statically prerender this page
// since it requires Supabase environment variables at runtime.
export const dynamic = "force-dynamic";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setError(null);
    setFieldErrors({});

    // Client-side Validation
    const validationResult = loginSchema.safeParse({ email, password });
    if (!validationResult.success) {
      const formattedErrors = validationResult.error.format();
      setFieldErrors({
        email: formattedErrors.email?._errors[0],
        password: formattedErrors.password?._errors[0],
      });
      return;
    }

    setLoading(true);

    // Call Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (!authData.user) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
      return;
    }

    // Client-side Onboarding Check
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("onboarding_complete")
      .eq("id", authData.user.id)
      .single();

    if (profileError) {
      console.warn(
        "Could not fetch profile, falling back safely: ",
        profileError.message
      );
    }

    const targetRoute = profile?.onboarding_complete
      ? "/scorecard"
      : "/onboarding";

    // Success - redirect directly to correct destination mapping and hydrate SSR framework
    router.push(targetRoute);
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setGoogleLoading(false);
    }
    // No explicit router push here on success, because OAuth redirects the entire window
  };

  return (
    <>
      <Card>
        <div className="p-2 sm:p-4">
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl font-black tracking-tight text-slate-900">
              Welcome back
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-400">
              Sign in to continue building habits
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-rose-100 bg-rose-50/50 px-5 py-4 text-center ring-1 ring-rose-100/50">
              <span className="text-sm font-bold text-rose-600">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              error={fieldErrors.email}
              disabled={loading || googleLoading}
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              error={fieldErrors.password}
              disabled={loading || googleLoading}
              autoComplete="current-password"
            />

            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                disabled={googleLoading}
              >
                Sign in
              </Button>
            </div>
          </form>

          <div className="my-8 flex items-center justify-between">
            <div className="flex-1 border-t border-slate-100"></div>
            <span className="px-5 text-sm font-black uppercase tracking-widest text-slate-300">
              or
            </span>
            <div className="flex-1 border-t border-slate-100"></div>
          </div>

          <div>
            <Button
              type="button"
              variant="secondary"
              fullWidth
              loading={googleLoading}
              disabled={loading}
              onClick={handleGoogleLogin}
              className="relative flex items-center justify-center rounded-2xl"
            >
              {/* Only show the icon if not loading the spinner from Button component */}
              {!googleLoading && (
                <svg
                  className="absolute left-6 mr-3 h-5 w-5"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
              )}
              Continue with Google
            </Button>
          </div>
        </div>
      </Card>

      <div className="mt-10 text-center text-sm font-medium text-slate-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-black text-white hover:text-primary transition-colors"
        >
          Sign up
        </Link>
      </div>
    </>
  );
}
