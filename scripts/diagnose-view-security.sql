-- =============================================
-- DIAGNOSE VIEW SECURITY ISSUES
-- =============================================
-- This script helps diagnose why views are being created with SECURITY DEFINER
-- Run this in your Supabase SQL Editor

-- Check current user and role
SELECT 
    current_user as current_user,
    session_user as session_user,
    current_setting('role') as current_role;

-- Check if we're running as a superuser
SELECT 
    CASE 
        WHEN current_setting('is_superuser') = 'on' THEN 'SUPERUSER'
        ELSE 'REGULAR USER'
    END as user_type;

-- Check the current views and their security context
SELECT 
    schemaname,
    viewname,
    viewowner,
    CASE 
        WHEN definition LIKE '%SECURITY DEFINER%' THEN 'SECURITY DEFINER'
        WHEN definition LIKE '%SECURITY INVOKER%' THEN 'SECURITY INVOKER'
        ELSE 'DEFAULT (INVOKER)'
    END as security_context,
    definition
FROM pg_views 
WHERE viewname IN ('listing_details', 'message_threads')
AND schemaname = 'public';

-- Check if there are any functions that might be creating these views
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND prosrc LIKE '%listing_details%' OR prosrc LIKE '%message_threads%';

-- Check for any triggers or other objects that might affect view creation
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name
FROM pg_trigger
WHERE tgname LIKE '%listing%' OR tgname LIKE '%message%';

-- Check the current search path
SHOW search_path;

-- Check if we're in a transaction
SELECT 
    CASE 
        WHEN txid_current() IS NOT NULL THEN 'IN TRANSACTION'
        ELSE 'NOT IN TRANSACTION'
    END as transaction_status; 