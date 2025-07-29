-- =============================================
-- TEST USER CREATION AND ROLE DETECTION
-- =============================================
-- This script helps debug user creation and role detection issues
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
WHERE tablename = 'users';

-- Check recent users (last 10)
SELECT 
    id,
    full_name,
    email,
    role,
    created_at
FROM public.users 
ORDER BY created_at DESC 
LIMIT 10;

-- Check if there are any users with null roles
SELECT 
    id,
    full_name,
    email,
    role,
    created_at
FROM public.users 
WHERE role IS NULL;

-- Check user role distribution
SELECT 
    role,
    COUNT(*) as count
FROM public.users 
GROUP BY role; 