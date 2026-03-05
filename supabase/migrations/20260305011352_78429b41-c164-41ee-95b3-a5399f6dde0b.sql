
-- Tighten the invitations update policy to only allow authenticated users to update unused invitations
DROP POLICY IF EXISTS "Anyone can update invitations" ON public.invitations;

CREATE POLICY "Authenticated can update invitations" ON public.invitations FOR UPDATE TO authenticated
USING (used_at IS NULL);
