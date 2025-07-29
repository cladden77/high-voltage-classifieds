-- =============================================
-- TEST ROLE ASSIGNMENT
-- =============================================
-- This script helps test and verify role assignment
-- Run this in your Supabase SQL Editor

-- Check the most recent user signups
SELECT 
    id,
    full_name,
    email,
    role,
    created_at
FROM public.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Check if there are any users with incorrect roles
-- (This would help identify if the issue is in the signup process)
SELECT 
    id,
    full_name,
    email,
    role,
    created_at,
    CASE 
        WHEN role = 'seller' THEN '✅ Correct'
        WHEN role = 'buyer' THEN '✅ Correct'
        ELSE '❌ Invalid Role'
    END as role_status
FROM public.users 
ORDER BY created_at DESC 
LIMIT 10;

-- Check role distribution for recent signups (last 7 days)
SELECT 
    role,
    COUNT(*) as count,
    CASE 
        WHEN role = 'seller' THEN '✅ Seller'
        WHEN role = 'buyer' THEN '✅ Buyer'
        ELSE '❌ Invalid'
    END as role_type
FROM public.users 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY role
ORDER BY count DESC;

-- Test inserting a user with seller role (for debugging)
-- Uncomment the lines below to test role insertion
/*
INSERT INTO public.users (id, email, full_name, role) 
VALUES (
    gen_random_uuid(), 
    'test-seller@example.com', 
    'Test Seller', 
    'seller'
) ON CONFLICT (email) DO NOTHING;

-- Check if the test user was created
SELECT * FROM public.users WHERE email = 'test-seller@example.com';
*/ 