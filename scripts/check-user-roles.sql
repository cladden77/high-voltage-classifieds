-- =============================================
-- CHECK USER ROLES
-- =============================================
-- This script helps debug user role assignment issues
-- Run this in your Supabase SQL Editor

-- Check recent users and their roles
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

-- Check role distribution
SELECT 
    role,
    COUNT(*) as count
FROM public.users 
GROUP BY role;

-- Check if RLS policies are working correctly
-- This will show if the current user can read their own profile
SELECT 
    id,
    full_name,
    email,
    role
FROM public.users 
WHERE id = auth.uid();

-- Check if the current user can insert into users table
-- (This should work if RLS policies are correct)
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()
        ) THEN 'User profile exists'
        ELSE 'User profile does not exist'
    END as profile_status; 