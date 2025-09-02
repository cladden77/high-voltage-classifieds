-- =============================================
-- FIX FUNCTION SEARCH PATH SECURITY WARNINGS
-- =============================================
-- This script fixes all function search_path security warnings
-- by adding SET search_path = public to all functions

-- Fix the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Fix user listing count function
CREATE OR REPLACE FUNCTION get_user_listing_count(user_uuid UUID)
RETURNS INTEGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM public.listings WHERE seller_id = user_uuid AND is_sold = false);
END;
$$;

-- Fix mark listing sold function  
CREATE OR REPLACE FUNCTION mark_listing_sold(listing_uuid UUID, buyer_uuid UUID, amount DECIMAL)
RETURNS UUID 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    order_id UUID;
    seller_uuid UUID;
BEGIN
    -- Get seller ID
    SELECT seller_id INTO seller_uuid FROM public.listings WHERE id = listing_uuid;
    
    -- Create order
    INSERT INTO public.orders (listing_id, buyer_id, seller_id, amount_paid, status)
    VALUES (listing_uuid, buyer_uuid, seller_uuid, amount, 'paid')
    RETURNING id INTO order_id;
    
    -- Mark listing as sold
    UPDATE public.listings SET is_sold = true WHERE id = listing_uuid;
    
    RETURN order_id;
END;
$$;

-- Fix clear all data function
CREATE OR REPLACE FUNCTION clear_all_data()
RETURNS VOID 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.orders;
    DELETE FROM public.messages;
    DELETE FROM public.favorites;
    DELETE FROM public.listings;
    DELETE FROM public.user_analytics;
    -- Note: Don't delete users as they're tied to auth.users
    RAISE NOTICE 'All listing data cleared successfully';
END;
$$;

-- Fix platform stats function
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS TABLE(
    total_users BIGINT,
    total_listings BIGINT,
    total_active_listings BIGINT,
    total_messages BIGINT,
    total_favorites BIGINT,
    total_orders BIGINT
) 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY SELECT
        (SELECT COUNT(*) FROM public.users) as total_users,
        (SELECT COUNT(*) FROM public.listings) as total_listings,
        (SELECT COUNT(*) FROM public.listings WHERE is_sold = false) as total_active_listings,
        (SELECT COUNT(*) FROM public.messages) as total_messages,
        (SELECT COUNT(*) FROM public.favorites) as total_favorites,
        (SELECT COUNT(*) FROM public.orders) as total_orders;
END;
$$;

-- Recreate our secure listing functions with fixed search_path
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
    location text,
    seller_id uuid,
    created_at timestamptz,
    updated_at timestamptz,
    image_urls text[],
    is_sold boolean,
    is_featured boolean,
    views_count integer,
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
SET search_path = public
AS $$
    SELECT 
        l.id,
        l.title,
        l.description,
        l.price,
        l.condition,
        l.category,
        l.location,
        l.seller_id,
        l.created_at,
        l.updated_at,
        l.image_urls,
        l.is_sold,
        l.is_featured,
        l.views_count,
        u.full_name as seller_name,
        u.email as seller_email,
        u.avatar_url as seller_avatar,
        u.location as seller_location,
        u.is_verified as seller_verified,
        (SELECT COUNT(*) FROM public.favorites f WHERE f.listing_id = l.id) as favorites_count
    FROM public.listings l
    JOIN public.users u ON l.seller_id = u.id
    WHERE l.is_sold = false
    AND (p_category IS NULL OR l.category = p_category)
    AND (p_seller_id IS NULL OR l.seller_id = p_seller_id)
    ORDER BY l.created_at DESC
    LIMIT COALESCE(p_limit, 100)
    OFFSET p_offset;
$$;

-- Recreate message threads function with fixed search_path
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
SET search_path = public
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

-- Recreate helper functions with fixed search_path
CREATE OR REPLACE FUNCTION public.get_all_listings()
RETURNS TABLE (
    id uuid,
    title text,
    description text,
    price decimal,
    condition public.listing_condition,
    category text,
    location text,
    seller_id uuid,
    created_at timestamptz,
    updated_at timestamptz,
    image_urls text[],
    is_sold boolean,
    is_featured boolean,
    views_count integer,
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
SET search_path = public
AS $$
    SELECT * FROM public.get_listing_details();
$$;

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
SET search_path = public
AS $$
    SELECT * FROM public.get_message_threads(auth.uid());
$$;

-- Verify all functions have proper security settings
SELECT 
    proname as function_name,
    prosecdef as is_security_definer,
    CASE 
        WHEN prosecdef = false THEN 'SECURITY INVOKER ✓'
        ELSE 'SECURITY DEFINER ✗'
    END as security_context,
    proacl as permissions,
    prosrc as source_contains_search_path
FROM pg_proc 
WHERE proname IN (
    'update_updated_at_column',
    'get_user_listing_count', 
    'mark_listing_sold',
    'clear_all_data',
    'get_platform_stats',
    'get_listing_details',
    'get_message_threads', 
    'get_all_listings',
    'get_user_message_threads'
)
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;

SELECT 'Function search_path security fixes applied successfully! ✅' as status;

-- Fix Function Search Path Security Warning
-- This script fixes the search_path security warning for the create_notification function

-- Recreate the create_notification function with fixed search_path
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_type TEXT DEFAULT 'info',
    p_related_id TEXT DEFAULT NULL,
    p_related_type TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        related_id,
        related_type
    ) VALUES (
        p_user_id,
        p_title,
        p_message,
        p_type,
        p_related_id,
        p_related_type
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_notification(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;