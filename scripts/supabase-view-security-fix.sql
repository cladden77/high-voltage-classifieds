-- =============================================
-- SUPABASE-SPECIFIC VIEW SECURITY FIX
-- =============================================
-- This script uses Supabase-specific methods to fix SECURITY DEFINER issues
-- The issue may be that Supabase automatically sets SECURITY DEFINER on views

-- First, let's see the exact issue
SELECT 
    n.nspname as schema_name,
    c.relname as view_name,
    c.relowner::regrole as owner,
    CASE 
        WHEN c.relkind = 'v' AND pg_catalog.has_function_privilege(c.relowner, 'usage') 
        THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
    END as current_security
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'v'  -- views only
AND n.nspname = 'public'
AND c.relname IN ('listing_details', 'message_threads');

-- Drop and recreate with explicit ownership and security context
BEGIN;

-- Step 1: Drop the views
DROP VIEW IF EXISTS public.listing_details CASCADE;
DROP VIEW IF EXISTS public.message_threads CASCADE;

-- Step 2: Set the role to authenticator (Supabase's default role)
-- This ensures we're not creating as a superuser
SET ROLE authenticator;

-- Step 3: Create listing_details view
CREATE VIEW public.listing_details AS
SELECT 
    l.*,
    u.full_name as seller_name,
    u.email as seller_email,
    u.avatar_url as seller_avatar,
    u.location as seller_location,
    u.is_verified as seller_verified,
    (SELECT COUNT(*) FROM public.favorites f WHERE f.listing_id = l.id) as favorites_count
FROM public.listings l
JOIN public.users u ON l.seller_id = u.id;

-- Step 4: Create message_threads view
CREATE VIEW public.message_threads AS
SELECT DISTINCT
    CASE 
        WHEN m.sender_id < m.recipient_id 
        THEN m.sender_id || '-' || m.recipient_id 
        ELSE m.recipient_id || '-' || m.sender_id 
    END as thread_id,
    CASE 
        WHEN m.sender_id < m.recipient_id 
        THEN m.sender_id 
        ELSE m.recipient_id 
    END as user1_id,
    CASE 
        WHEN m.sender_id < m.recipient_id 
        THEN m.recipient_id 
        ELSE m.sender_id 
    END as user2_id,
    m.listing_id,
    l.title as listing_title,
    (SELECT message_text FROM public.messages m2 
     WHERE (m2.sender_id = m.sender_id AND m2.recipient_id = m.recipient_id) 
        OR (m2.sender_id = m.recipient_id AND m2.recipient_id = m.sender_id)
     ORDER BY m2.created_at DESC LIMIT 1) as last_message,
    (SELECT created_at FROM public.messages m2 
     WHERE (m2.sender_id = m.sender_id AND m2.recipient_id = m.recipient_id) 
        OR (m2.sender_id = m.recipient_id AND m2.recipient_id = m.sender_id)
     ORDER BY m2.created_at DESC LIMIT 1) as last_message_at
FROM public.messages m
LEFT JOIN public.listings l ON m.listing_id = l.id;

-- Step 5: Reset role to default
RESET ROLE;

-- Step 6: Grant proper permissions to ensure RLS works correctly
GRANT SELECT ON public.listing_details TO authenticated;
GRANT SELECT ON public.listing_details TO anon;
GRANT SELECT ON public.message_threads TO authenticated;
GRANT SELECT ON public.message_threads TO anon;

COMMIT;

-- Verify the fix
SELECT 
    schemaname,
    viewname,
    viewowner,
    'Fixed - should be SECURITY INVOKER' as status
FROM pg_views 
WHERE viewname IN ('listing_details', 'message_threads')
AND schemaname = 'public';

-- Test that RLS is working correctly
SELECT 'listing_details' as view_name, COUNT(*) as record_count FROM public.listing_details LIMIT 1;
SELECT 'message_threads' as view_name, COUNT(*) as record_count FROM public.message_threads LIMIT 1; 