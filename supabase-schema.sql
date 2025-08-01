-- =============================================
-- HIGH VOLTAGE CLASSIFIEDS DATABASE SCHEMA
-- =============================================
-- This schema supports the complete classifieds platform
-- Run this in your Supabase SQL Editor

-- =============================================
-- 1. ENABLE REQUIRED EXTENSIONS
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 2. CREATE CUSTOM TYPES
-- =============================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('buyer', 'seller');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE listing_condition AS ENUM ('new', 'like_new', 'good', 'fair', 'poor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'paid', 'failed', 'cancelled', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- 3. CREATE TABLES
-- =============================================

-- 👥 USERS TABLE
-- Extends Supabase auth.users with profile information
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'buyer',
    avatar_url TEXT,
    phone TEXT,
    location TEXT,
    bio TEXT,
    website TEXT,
    company_name TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📦 LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    location TEXT NOT NULL,
    category TEXT NOT NULL,
    condition listing_condition NOT NULL DEFAULT 'good',
    image_urls TEXT[] DEFAULT '{}',
    seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    is_sold BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 💬 MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ❤️ FAVORITES TABLE
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, listing_id)
);

-- 💳 ORDERS TABLE (for payment tracking)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL, -- 'stripe', 'paypal'
    payment_intent_id TEXT, -- Stripe payment intent ID
    paypal_order_id TEXT, -- PayPal order ID
    status order_status NOT NULL DEFAULT 'pending',
    shipping_address JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📊 USER ANALYTICS TABLE (optional)
CREATE TABLE IF NOT EXISTS public.user_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    listings_count INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON public.listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_location ON public.listings(location);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at);
CREATE INDEX IF NOT EXISTS idx_listings_price ON public.listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_is_sold ON public.listings(is_sold);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_listing_id ON public.messages(listing_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON public.favorites(listing_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_listing_id ON public.orders(listing_id);

-- =============================================
-- 5. CREATE UPDATED_AT TRIGGERS
-- =============================================
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

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 7. CREATE RLS POLICIES
-- =============================================

-- 👥 USERS POLICIES (PERFORMANCE OPTIMIZED)
-- Consolidated SELECT policy for better performance
CREATE POLICY "Users can view profiles" ON public.users
    FOR SELECT USING (
        (select auth.uid()) = id OR  -- Own profile
        true                         -- Public profiles
    );

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK ((select auth.uid()) = id);

-- 📦 LISTINGS POLICIES (PERFORMANCE OPTIMIZED)
CREATE POLICY "Anyone can view published listings" ON public.listings
    FOR SELECT USING (true);

CREATE POLICY "Sellers can create listings" ON public.listings
    FOR INSERT WITH CHECK ((select auth.uid()) = seller_id);

CREATE POLICY "Sellers can update their own listings" ON public.listings
    FOR UPDATE USING ((select auth.uid()) = seller_id);

CREATE POLICY "Sellers can delete their own listings" ON public.listings
    FOR DELETE USING ((select auth.uid()) = seller_id);

-- 💬 MESSAGES POLICIES (PERFORMANCE OPTIMIZED)
CREATE POLICY "Users can view their own messages" ON public.messages
    FOR SELECT USING (
        (select auth.uid()) = sender_id OR 
        (select auth.uid()) = recipient_id
    );

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK ((select auth.uid()) = sender_id);

CREATE POLICY "Users can update their own sent messages" ON public.messages
    FOR UPDATE USING ((select auth.uid()) = sender_id);

-- ❤️ FAVORITES POLICIES (PERFORMANCE OPTIMIZED)
CREATE POLICY "Users can view their own favorites" ON public.favorites
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can add favorites" ON public.favorites
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can remove their own favorites" ON public.favorites
    FOR DELETE USING ((select auth.uid()) = user_id);

-- 💳 ORDERS POLICIES (PERFORMANCE OPTIMIZED & CONSOLIDATED)
-- Consolidated SELECT policy eliminates multiple permissive policies warning
CREATE POLICY "Users can view relevant orders" ON public.orders
    FOR SELECT USING (
        (select auth.uid()) = buyer_id OR    -- Buyers can view their orders
        (select auth.uid()) = seller_id      -- Sellers can view orders for their listings
    );

CREATE POLICY "Buyers can create orders" ON public.orders
    FOR INSERT WITH CHECK ((select auth.uid()) = buyer_id);

CREATE POLICY "Buyers can update their own orders" ON public.orders
    FOR UPDATE USING ((select auth.uid()) = buyer_id);

-- 📊 USER ANALYTICS POLICIES (PERFORMANCE OPTIMIZED)
CREATE POLICY "Users can view their own analytics" ON public.user_analytics
    FOR SELECT USING ((select auth.uid()) = user_id);

-- =============================================
-- 8.1. VIEW SECURITY POLICIES
-- =============================================

-- Enable RLS on views (views inherit RLS from underlying tables)
-- The views will automatically respect the RLS policies of their underlying tables
-- listing_details view inherits RLS from listings and users tables
-- message_threads view inherits RLS from messages and listings tables

-- =============================================
-- 8. CREATE STORAGE BUCKET
-- =============================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for listing images
CREATE POLICY "Anyone can view listing images" ON storage.objects
    FOR SELECT USING (bucket_id = 'listing-images');

CREATE POLICY "Authenticated users can upload listing images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'listing-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own listing images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own listing images" ON storage.objects
    FOR DELETE USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================
-- 9. CREATE HELPFUL FUNCTIONS
-- =============================================

-- Function to get user's listing count
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

-- Function to mark listing as sold and create order
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

-- =============================================
-- 10. SEED DATA FOR DEVELOPMENT
-- =============================================

-- Insert demo users (Note: In production, users are created via Supabase Auth)
-- These are for testing - you'll need to create actual auth users first
-- INSERT INTO public.users (id, full_name, email, role, location, bio) VALUES
-- ('01234567-89ab-cdef-0123-456789abcdef', 'John Smith', 'john.smith@example.com', 'seller', 'Los Angeles, CA', 'Electrical contractor with 15 years experience'),
-- ('11234567-89ab-cdef-0123-456789abcdef', 'Sarah Johnson', 'sarah.johnson@example.com', 'buyer', 'Phoenix, AZ', 'Procurement manager for solar installations');

-- Sample categories for reference
DO $$
BEGIN
    -- You can insert sample listings after creating auth users
    -- Example listings would go here
END $$;

-- =============================================
-- 11. SECURE FUNCTIONS (INDUSTRY STANDARD)
-- =============================================
-- Using functions instead of views for maximum security and RLS compliance
-- All functions use SECURITY INVOKER to prevent privilege escalation

-- Secure function for listing details with seller information
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

-- Secure function for message threads with enhanced security
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

-- Helper function for simple listing access (backward compatibility)
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

-- Helper function for user's message threads (auto uses auth.uid())
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

-- Grant proper permissions
GRANT EXECUTE ON FUNCTION public.get_listing_details(integer, integer, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_listing_details(integer, integer, text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_message_threads(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_listings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_listings() TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_message_threads() TO authenticated;

-- =============================================
-- SETUP COMPLETE!
-- =============================================
-- Your High Voltage Classifieds database is ready!
-- 
-- Next steps:
-- 1. Run this schema in your Supabase SQL Editor
-- 2. Create auth users via Supabase Auth (signup/signin)
-- 3. Test the application with real user accounts
-- 4. Add sample listings and test all features
-- 
-- Remember to set your environment variables:
-- - NEXT_PUBLIC_SUPABASE_URL
-- - NEXT_PUBLIC_SUPABASE_ANON_KEY  
-- - SUPABASE_SERVICE_ROLE_KEY 