-- =============================================
-- CONVERT VIEWS TO FUNCTIONS (SUPABASE RECOMMENDED)
-- =============================================
-- This converts the problematic views to functions which don't have 
-- SECURITY DEFINER issues and are preferred by Supabase for complex queries

-- Drop the existing views that are causing SECURITY DEFINER warnings
DROP VIEW IF EXISTS public.listing_details CASCADE;
DROP VIEW IF EXISTS public.message_threads CASCADE;

-- Create listing_details as a function instead of a view
CREATE OR REPLACE FUNCTION public.get_listing_details()
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
    WHERE l.is_active = true;
$$;

-- Create message_threads as a function instead of a view
CREATE OR REPLACE FUNCTION public.get_message_threads()
RETURNS TABLE (
    thread_id text,
    user1_id uuid,
    user2_id uuid,
    listing_id uuid,
    listing_title text,
    last_message text,
    last_message_at timestamptz
)
LANGUAGE sql
SECURITY INVOKER
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
         ORDER BY m2.created_at DESC LIMIT 1) as last_message_at
    FROM public.messages m
    LEFT JOIN public.listings l ON m.listing_id = l.id;
$$;

-- Grant permissions on the functions
GRANT EXECUTE ON FUNCTION public.get_listing_details() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_listing_details() TO anon;
GRANT EXECUTE ON FUNCTION public.get_message_threads() TO authenticated;

-- Test the functions work
SELECT 'get_listing_details' as function_name, COUNT(*) as record_count 
FROM public.get_listing_details() LIMIT 1;

SELECT 'get_message_threads' as function_name, COUNT(*) as record_count 
FROM public.get_message_threads() LIMIT 1;

-- Show the functions were created successfully
SELECT 
    proname as function_name,
    prosecdef as is_security_definer,
    CASE 
        WHEN prosecdef = false THEN 'SECURITY INVOKER (GOOD)'
        ELSE 'SECURITY DEFINER (BAD)'
    END as security_context
FROM pg_proc 
WHERE proname IN ('get_listing_details', 'get_message_threads')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'); 