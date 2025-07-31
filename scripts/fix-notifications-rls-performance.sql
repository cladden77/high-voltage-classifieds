-- Fix RLS Performance Issues for notifications table
-- This script addresses the Supabase performance warnings about auth.uid() re-evaluation

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

-- Recreate policies with optimized auth.uid() calls
-- Using (select auth.uid()) prevents re-evaluation for each row
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING ((select auth.uid()) = user_id);

-- Keep the service role policy as is (it doesn't use auth.uid())
-- CREATE POLICY "Service role can insert notifications" ON public.notifications
--     FOR INSERT WITH CHECK (true);

-- Verify the policies were updated
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'notifications'
ORDER BY policyname; 