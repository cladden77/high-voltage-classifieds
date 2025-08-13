-- Fix RLS policies to allow users to see basic profile information of other users
-- This is needed for the messaging system to work properly

-- First, let's see the current RLS policies on the users table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users';

-- The current policy "Users can view profiles" should allow this, but let's verify
-- and create a more specific policy for messaging purposes

-- Create a policy specifically for viewing user profiles in conversations
CREATE POLICY "Users can view profiles for messaging" ON public.users
    FOR SELECT USING (
        -- Allow viewing any user profile (needed for messaging)
        true
    );

-- Alternative: If you want to be more restrictive, you can use this instead:
-- CREATE POLICY "Users can view profiles for messaging" ON public.users
--     FOR SELECT USING (
--         -- Allow viewing user profiles if they're involved in conversations
--         EXISTS (
--             SELECT 1 FROM messages m 
--             WHERE m.sender_id = auth.uid() AND m.recipient_id = users.id
--                OR m.recipient_id = auth.uid() AND m.sender_id = users.id
--         )
--     );

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users';

-- Test the policy by running this as a regular user (should work now)
-- SELECT id, full_name, email FROM users LIMIT 5;
