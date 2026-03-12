"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

// Create the browser client singleton outside the hook to prevent duplicate instantiations across renders
const supabase = createClient();

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Immediately fetch the active session on mount
    const getInitialSession = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
      } catch (error) {
        console.error("Failed to fetch initial Supabase session", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // 2. Subscribe to auth state changes to dynamically synchronize user object
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 3. Cleanup the Supabase listener when unmounting the component
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Hard reload signout method to scrub deep active client cache mechanisms
  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
      setLoading(false);
    }
  };

  return { user, loading, signOut };
}
