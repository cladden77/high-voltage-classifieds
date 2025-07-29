-- =============================================
-- FIX VIEW SECURITY ISSUES
-- =============================================
-- This script fixes the Supabase security linter warnings about SECURITY DEFINER views
-- Run this in your Supabase SQL Editor

-- Drop existing views
DROP VIEW IF EXISTS public.listing_details;
DROP VIEW IF EXISTS public.message_threads;

-- Recreate views with SECURITY INVOKER (default secure behavior)
CREATE OR REPLACE VIEW public.listing_details SECURITY INVOKER AS
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

-- Recreate message threads view with SECURITY INVOKER
CREATE OR REPLACE VIEW public.message_threads SECURITY INVOKER AS
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

-- Verify the views are now SECURITY INVOKER
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE viewname IN ('listing_details', 'message_threads')
AND schemaname = 'public';

-- Test that the views work correctly
-- (These queries should respect RLS policies)
SELECT COUNT(*) as listing_details_count FROM public.listing_details LIMIT 1;
SELECT COUNT(*) as message_threads_count FROM public.message_threads LIMIT 1; 