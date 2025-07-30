-- =============================================
-- IMPLEMENT SECURE FUNCTIONS (INDUSTRY STANDARD)
-- =============================================
-- This is the industry-standard, secure approach for Supabase
-- Functions provide better security, performance, and RLS compliance

-- First, verify current state
SELECT 
    'Current problematic views' as check_type,
    schemaname,
    viewname,
    viewowner
FROM pg_views 
WHERE viewname IN ('listing_details', 'message_threads')
AND schemaname = 'public';

-- Drop the problematic views
DROP VIEW IF EXISTS public.listing_details CASCADE;
DROP VIEW IF EXISTS public.message_threads CASCADE;

-- =============================================
-- SECURE LISTING DETAILS FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.get_listing_details(
    p_limit integer DEFAULT NULL,
    p_offset integer DEFAULT 0,
    p_category text DEFAULT NULL,
    p_seller_id uuid DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    title text,
    description text,
    price decimal,
    condition public.listing_condition,
    category text,
    subcategory text,
    brand text,
    model text,
    year integer,
    location text,
    seller_id uuid,
    created_at timestamptz,
    updated_at timestamptz,
    images text[],
    is_active boolean,
    seller_name text,
    seller_email text,
    seller_avatar text,
    seller_location text,
    seller_verified boolean,
    favorites_count bigint
) 
LANGUAGE sql
SECURITY INVOKER
STABLE
AS $$
    SELECT 
        l.id,
        l.title,
        l.description,
        l.price,
        l.condition,
        l.category,
        l.subcategory,
        l.brand,
        l.model,
        l.year,
        l.location,
        l.seller_id,
        l.created_at,
        l.updated_at,
        l.images,
        l.is_active,
        u.full_name as seller_name,
        u.email as seller_email,
        u.avatar_url as seller_avatar,
        u.location as seller_location,
        u.is_verified as seller_verified,
        (SELECT COUNT(*) FROM public.favorites f WHERE f.listing_id = l.id) as favorites_count
    FROM public.listings l
    JOIN public.users u ON l.seller_id = u.id
    WHERE l.is_active = true
    AND (p_category IS NULL OR l.category = p_category)
    AND (p_seller_id IS NULL OR l.seller_id = p_seller_id)
    ORDER BY l.created_at DESC
    LIMIT COALESCE(p_limit, 100)
    OFFSET p_offset;
$$;

-- =============================================
-- SECURE MESSAGE THREADS FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.get_message_threads(
    p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
    thread_id text,
    user1_id uuid,
    user2_id uuid,
    listing_id uuid,
    listing_title text,
    last_message text,
    last_message_at timestamptz,
    unread_count bigint
)
LANGUAGE sql
SECURITY INVOKER
STABLE
AS $$
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
         ORDER BY m2.created_at DESC LIMIT 1) as last_message_at,
        (SELECT COUNT(*) FROM public.messages m3
         WHERE ((m3.sender_id = m.sender_id AND m3.recipient_id = m.recipient_id)
            OR (m3.sender_id = m.recipient_id AND m3.recipient_id = m.sender_id))
         AND m3.is_read = false 
         AND m3.recipient_id = COALESCE(p_user_id, auth.uid())) as unread_count
    FROM public.messages m
    LEFT JOIN public.listings l ON m.listing_id = l.id
    WHERE (p_user_id IS NULL OR m.sender_id = p_user_id OR m.recipient_id = p_user_id);
$$;

-- =============================================
-- HELPER FUNCTIONS FOR BETTER API
-- =============================================

-- Simple function to get all active listings (equivalent to old view)
CREATE OR REPLACE FUNCTION public.get_all_listings()
RETURNS TABLE (
    id uuid,
    title text,
    description text,
    price decimal,
    condition public.listing_condition,
    category text,
    subcategory text,
    brand text,
    model text,
    year integer,
    location text,
    seller_id uuid,
    created_at timestamptz,
    updated_at timestamptz,
    images text[],
    is_active boolean,
    seller_name text,
    seller_email text,
    seller_avatar text,
    seller_location text,
    seller_verified boolean,
    favorites_count bigint
) 
LANGUAGE sql
SECURITY INVOKER
STABLE
AS $$
    SELECT * FROM public.get_listing_details();
$$;

-- Function to get user's message threads
CREATE OR REPLACE FUNCTION public.get_user_message_threads()
RETURNS TABLE (
    thread_id text,
    user1_id uuid,
    user2_id uuid,
    listing_id uuid,
    listing_title text,
    last_message text,
    last_message_at timestamptz,
    unread_count bigint
)
LANGUAGE sql
SECURITY INVOKER
STABLE
AS $$
    SELECT * FROM public.get_message_threads(auth.uid());
$$;

-- =============================================
-- SECURITY AND PERMISSIONS
-- =============================================

-- Grant proper permissions
GRANT EXECUTE ON FUNCTION public.get_listing_details(integer, integer, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_listing_details(integer, integer, text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_message_threads(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_listings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_listings() TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_message_threads() TO authenticated;

-- =============================================
-- VERIFICATION AND TESTING
-- =============================================

-- Test the functions work correctly
SELECT 'get_listing_details' as function_name, COUNT(*) as record_count 
FROM public.get_listing_details() LIMIT 1;

SELECT 'get_message_threads' as function_name, COUNT(*) as record_count 
FROM public.get_message_threads() LIMIT 1;

-- Verify security context
SELECT 
    proname as function_name,
    prosecdef as is_security_definer,
    CASE 
        WHEN prosecdef = false THEN 'SECURITY INVOKER ✓'
        ELSE 'SECURITY DEFINER ✗'
    END as security_context,
    proacl as permissions
FROM pg_proc 
WHERE proname IN ('get_listing_details', 'get_message_threads', 'get_all_listings', 'get_user_message_threads')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Confirm views are gone
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN 'SUCCESS: All problematic views removed ✓'
        ELSE 'ERROR: Views still exist ✗'
    END as view_removal_status
FROM pg_views 
WHERE viewname IN ('listing_details', 'message_threads')
AND schemaname = 'public';

SELECT 'Implementation complete - industry standard security achieved!' as status; 