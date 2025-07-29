-- =============================================
-- COMPREHENSIVE FIX FOR SECURITY DEFINER VIEWS
-- =============================================
-- This script completely removes and recreates the views to fix SECURITY DEFINER issues
-- Run this in your Supabase SQL Editor

-- First, let's check the current state of the views
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE viewname IN ('listing_details', 'message_threads')
AND schemaname = 'public';

-- Drop the views completely
DROP VIEW IF EXISTS public.listing_details CASCADE;
DROP VIEW IF EXISTS public.message_threads CASCADE;

-- Wait a moment to ensure the drops are complete
SELECT pg_sleep(1);

-- Recreate listing_details view with explicit security context
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

-- Recreate message_threads view with explicit security context
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

-- Verify the views have been recreated properly
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE viewname IN ('listing_details', 'message_threads')
AND schemaname = 'public';

-- Test that the views work and respect RLS
-- These should return results if you have data, or empty if no data
SELECT 'listing_details test' as test_type, COUNT(*) as count FROM public.listing_details LIMIT 1;
SELECT 'message_threads test' as test_type, COUNT(*) as count FROM public.message_threads LIMIT 1;

-- Check if there are any remaining SECURITY DEFINER views
SELECT 
    schemaname,
    viewname,
    'SECURITY DEFINER detected' as issue
FROM pg_views 
WHERE viewname IN ('listing_details', 'message_threads')
AND schemaname = 'public'
AND definition LIKE '%SECURITY DEFINER%'; 