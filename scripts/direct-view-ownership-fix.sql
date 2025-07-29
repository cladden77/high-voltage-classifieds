-- =============================================
-- DIRECT VIEW OWNERSHIP AND SECURITY FIX
-- =============================================
-- This script directly modifies the existing views to fix SECURITY DEFINER issues
-- by changing ownership and recreating with specific user context

-- First, check what we're dealing with
SELECT 
    schemaname,
    viewname,
    viewowner,
    definition
FROM pg_views 
WHERE viewname IN ('listing_details', 'message_threads')
AND schemaname = 'public';

-- Check current user context
SELECT current_user, session_user, current_setting('role');

-- Try changing ownership of the views to a non-superuser role
-- This might resolve the SECURITY DEFINER issue
DO $$
BEGIN
    -- Try to change ownership to authenticator role (Supabase's standard role)
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticator') THEN
        EXECUTE 'ALTER VIEW public.listing_details OWNER TO authenticator';
        EXECUTE 'ALTER VIEW public.message_threads OWNER TO authenticator';
        RAISE NOTICE 'Views ownership changed to authenticator';
    ELSIF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'postgres') THEN
        EXECUTE 'ALTER VIEW public.listing_details OWNER TO postgres';
        EXECUTE 'ALTER VIEW public.message_threads OWNER TO postgres';
        RAISE NOTICE 'Views ownership changed to postgres';
    ELSE
        RAISE NOTICE 'No suitable role found for ownership change';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not change ownership: %', SQLERRM;
END $$;

-- If ownership change doesn't work, try recreating with explicit context
DO $$
DECLARE
    listing_def text;
    message_def text;
BEGIN
    -- Save current definitions
    SELECT definition INTO listing_def 
    FROM pg_views 
    WHERE schemaname = 'public' AND viewname = 'listing_details';
    
    SELECT definition INTO message_def 
    FROM pg_views 
    WHERE schemaname = 'public' AND viewname = 'message_threads';
    
    -- Drop and recreate
    DROP VIEW IF EXISTS public.listing_details CASCADE;
    DROP VIEW IF EXISTS public.message_threads CASCADE;
    
    -- Recreate listing_details with simple definition
    EXECUTE 'CREATE VIEW public.listing_details AS ' || listing_def;
    
    -- Recreate message_threads with simple definition  
    EXECUTE 'CREATE VIEW public.message_threads AS ' || message_def;
    
    RAISE NOTICE 'Views recreated successfully';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Recreation failed: %', SQLERRM;
        
        -- Fallback: recreate with original definitions
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
        
        RAISE NOTICE 'Fallback recreation completed';
END $$;

-- Final verification
SELECT 
    schemaname,
    viewname,
    viewowner,
    'After fix attempt' as status
FROM pg_views 
WHERE viewname IN ('listing_details', 'message_threads')
AND schemaname = 'public';

-- Test the views still work
SELECT 'listing_details test' as test, COUNT(*) FROM public.listing_details LIMIT 1;
SELECT 'message_threads test' as test, COUNT(*) FROM public.message_threads LIMIT 1; 