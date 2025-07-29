-- =============================================
-- DEBUG ROLE INSERTION
-- =============================================
-- This script helps debug role insertion issues
-- Run this in your Supabase SQL Editor

-- Check if RLS is enabled on users table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'users';

-- Check all RLS policies on users table
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
ORDER BY policyname;

-- Check the users table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if the role enum type exists and has correct values
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'user_role'
ORDER BY e.enumsortorder;

-- Test if we can insert with different roles (as authenticated user)
-- This will help identify if the issue is with RLS policies
SELECT 
    'Testing INSERT permissions' as test_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()
        ) THEN '✅ User profile exists'
        ELSE '❌ User profile does not exist'
    END as profile_status;

-- Check recent failed insertions (if any)
-- This might show in the logs if there are permission issues
SELECT 
    'No direct way to check failed insertions' as note,
    'Check Supabase logs for INSERT errors' as suggestion; 