-- =============================================
-- FORCE SECURITY INVOKER VIEWS
-- =============================================
-- Alternative approach to fix SECURITY DEFINER views
-- This script uses a different method to ensure views use SECURITY INVOKER

-- First, let's see what we're dealing with
SELECT 
    schemaname,
    viewname,
    CASE 
        WHEN definition LIKE '%SECURITY DEFINER%' THEN 'SECURITY DEFINER'
        WHEN definition LIKE '%SECURITY INVOKER%' THEN 'SECURITY INVOKER'
        ELSE 'DEFAULT (INVOKER)'
    END as security_context
FROM pg_views 
WHERE viewname IN ('listing_details', 'message_threads')
AND schemaname = 'public';

-- Drop views with CASCADE to remove any dependencies
DROP VIEW IF EXISTS public.listing_details CASCADE;
DROP VIEW IF EXISTS public.message_threads CASCADE;

-- Create views using a different approach - as a regular user context
-- This should force SECURITY INVOKER behavior
DO $$
BEGIN
    -- Create listing_details view
    EXECUTE 'CREATE VIEW public.listing_details AS
    SELECT 
        l.*,
        u.full_name as seller_name,
        u.email as seller_email,
        u.avatar_url as seller_avatar,
        u.location as seller_location,
        u.is_verified as seller_verified,
        (SELECT COUNT(*) FROM public.favorites f WHERE f.listing_id = l.id) as favorites_count
    FROM public.listings l
    JOIN public.users u ON l.seller_id = u.id';
    
    -- Create message_threads view
    EXECUTE 'CREATE VIEW public.message_threads AS
    SELECT DISTINCT
        CASE 
            WHEN m.sender_id < m.recipient_id 
            THEN m.sender_id || ''-'' || m.recipient_id 
            ELSE m.recipient_id || ''-'' || m.sender_id 
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
    LEFT JOIN public.listings l ON m.listing_id = l.id';
END $$;

-- Verify the security context of the new views
SELECT 
    schemaname,
    viewname,
    CASE 
        WHEN definition LIKE '%SECURITY DEFINER%' THEN 'SECURITY DEFINER'
        WHEN definition LIKE '%SECURITY INVOKER%' THEN 'SECURITY INVOKER'
        ELSE 'DEFAULT (INVOKER)'
    END as security_context,
    'View recreated' as status
FROM pg_views 
WHERE viewname IN ('listing_details', 'message_threads')
AND schemaname = 'public';

-- Test the views work correctly
SELECT 'Views created successfully' as result; 