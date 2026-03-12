-- ============================================================
-- Accountability Partners (US-11)
-- Two new tables: partnerships + nudges
-- Partner read policies on existing tables
-- ============================================================

-- =========================
-- Table: partnerships
-- =========================

CREATE TABLE public.partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  invite_token TEXT NOT NULL UNIQUE,
  invite_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================
-- Table: nudges
-- =========================

CREATE TABLE public.nudges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL DEFAULT 'Keep going! 💪',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================
-- Enable RLS
-- =========================

ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nudges ENABLE ROW LEVEL SECURITY;

-- =========================
-- RLS: partnerships
-- =========================

CREATE POLICY "Users see own partnerships" ON public.partnerships FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = partner_id);

CREATE POLICY "Users create partnerships" ON public.partnerships FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users update own partnerships" ON public.partnerships FOR UPDATE
  USING (auth.uid() = requester_id OR auth.uid() = partner_id);

CREATE POLICY "Users delete own partnerships" ON public.partnerships FOR DELETE
  USING (auth.uid() = requester_id OR auth.uid() = partner_id);

-- =========================
-- RLS: nudges
-- =========================

CREATE POLICY "Users see own nudges" ON public.nudges FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users send nudges" ON public.nudges FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receivers update nudges" ON public.nudges FOR UPDATE
  USING (auth.uid() = receiver_id);

-- =========================
-- Partner read policies on existing tables
-- These are SELECT-only and additive (Postgres OR's permissive policies).
-- Existing "Users access own data" FOR ALL policies remain untouched.
-- =========================

-- Helper: checks if auth.uid() has an active partnership with the row's user_id
-- Used in every policy below. Written inline since Supabase doesn't support
-- reusable RLS functions cleanly.

-- profiles: partners can read each other's profile
CREATE POLICY "Partners can view profiles" ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.partnerships
      WHERE status = 'active'
      AND (
        (requester_id = auth.uid() AND partner_id = profiles.id)
        OR (partner_id = auth.uid() AND requester_id = profiles.id)
      )
    )
  );

-- routines: partners can read each other's routines
CREATE POLICY "Partners can view routines" ON public.routines FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.partnerships
      WHERE status = 'active'
      AND (
        (requester_id = auth.uid() AND partner_id = routines.user_id)
        OR (partner_id = auth.uid() AND requester_id = routines.user_id)
      )
    )
  );

-- check_ins: partners can read each other's check-ins
CREATE POLICY "Partners can view check_ins" ON public.check_ins FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.partnerships
      WHERE status = 'active'
      AND (
        (requester_id = auth.uid() AND partner_id = check_ins.user_id)
        OR (partner_id = auth.uid() AND requester_id = check_ins.user_id)
      )
    )
  );

-- habit_stacks: partners can read each other's stacks
CREATE POLICY "Partners can view habit_stacks" ON public.habit_stacks FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.partnerships
      WHERE status = 'active'
      AND (
        (requester_id = auth.uid() AND partner_id = habit_stacks.user_id)
        OR (partner_id = auth.uid() AND requester_id = habit_stacks.user_id)
      )
    )
  );

-- identities: partners can read each other's identities
CREATE POLICY "Partners can view identities" ON public.identities FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.partnerships
      WHERE status = 'active'
      AND (
        (requester_id = auth.uid() AND partner_id = identities.user_id)
        OR (partner_id = auth.uid() AND requester_id = identities.user_id)
      )
    )
  );

-- identity_habits: partners can read each other's identity-habit links
CREATE POLICY "Partners can view identity_habits" ON public.identity_habits FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.partnerships
      WHERE status = 'active'
      AND (
        (requester_id = auth.uid() AND partner_id = identity_habits.user_id)
        OR (partner_id = auth.uid() AND requester_id = identity_habits.user_id)
      )
    )
  );

-- =========================
-- Triggers
-- =========================

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.partnerships
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);
