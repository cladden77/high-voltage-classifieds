-- Allow users to delete (dismiss) their own notifications from the client.
-- Run in Supabase SQL Editor if dismiss (X) in the app returns RLS errors.

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;

CREATE POLICY "Users can delete own notifications" ON public.notifications
    FOR DELETE USING ((select auth.uid()) = user_id);
