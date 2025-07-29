-- =============================================
-- FIX USER INSERT POLICY
-- =============================================
-- This script adds the missing INSERT policy for the users table
-- Run this in your Supabase SQL Editor

-- Add INSERT policy for users table
CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Verify the policy was created
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
WHERE tablename = 'users' 
AND policyname = 'Users can insert their own profile'; 