-- Fix SELECT on pending invites so a user can see an invite before accepting
CREATE POLICY "Users can read pending invites" ON public.partnerships FOR SELECT
  USING (status = 'pending');

-- Fix UPDATE on pending invites so a user can accept or decline them (since they aren't the requester or partner yet)
CREATE POLICY "Users can reply to pending invites" ON public.partnerships FOR UPDATE
  USING (status = 'pending')
  WITH CHECK (
    (status = 'active' AND partner_id = auth.uid()) OR
    (status = 'declined' AND partner_id IS NULL)
  );

-- Fix profile visibility for the invite page so you can see who invited you
CREATE POLICY "View profiles of pending invite requesters" ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.partnerships
      WHERE status = 'pending'
      AND requester_id = profiles.id
    )
  );
