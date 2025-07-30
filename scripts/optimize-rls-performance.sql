-- =============================================
-- OPTIMIZE RLS PERFORMANCE
-- =============================================
-- This script optimizes Row Level Security policies for better performance
-- 1. Wraps auth.uid() in SELECT subqueries to prevent re-evaluation per row
-- 2. Consolidates multiple permissive policies into single optimized policies

-- First, drop existing policies to recreate them optimized
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.users;

DROP POLICY IF EXISTS "Sellers can create listings" ON public.listings;
DROP POLICY IF EXISTS "Sellers can update their own listings" ON public.listings;
DROP POLICY IF EXISTS "Sellers can delete their own listings" ON public.listings;

DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own sent messages" ON public.messages;

DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can add favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can remove their own favorites" ON public.favorites;

DROP POLICY IF EXISTS "Buyers can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Sellers can view orders for their listings" ON public.orders;
DROP POLICY IF EXISTS "Buyers can create orders" ON public.orders;
DROP POLICY IF EXISTS "Buyers can update their own orders" ON public.orders;

DROP POLICY IF EXISTS "Users can view their own analytics" ON public.user_analytics;

-- =============================================
-- OPTIMIZED USERS POLICIES
-- =============================================

-- Consolidated SELECT policy for users (combines own profile + public profiles)
CREATE POLICY "Users can view profiles" ON public.users
    FOR SELECT USING (
        (select auth.uid()) = id OR  -- Own profile
        true                         -- Public profiles
    );

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK ((select auth.uid()) = id);

-- =============================================
-- OPTIMIZED LISTINGS POLICIES
-- =============================================

CREATE POLICY "Sellers can create listings" ON public.listings
    FOR INSERT WITH CHECK ((select auth.uid()) = seller_id);

CREATE POLICY "Sellers can update their own listings" ON public.listings
    FOR UPDATE USING ((select auth.uid()) = seller_id);

CREATE POLICY "Sellers can delete their own listings" ON public.listings
    FOR DELETE USING ((select auth.uid()) = seller_id);

-- =============================================
-- OPTIMIZED MESSAGES POLICIES
-- =============================================

CREATE POLICY "Users can view their own messages" ON public.messages
    FOR SELECT USING (
        (select auth.uid()) = sender_id OR 
        (select auth.uid()) = recipient_id
    );

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK ((select auth.uid()) = sender_id);

CREATE POLICY "Users can update their own sent messages" ON public.messages
    FOR UPDATE USING ((select auth.uid()) = sender_id);

-- =============================================
-- OPTIMIZED FAVORITES POLICIES
-- =============================================

CREATE POLICY "Users can view their own favorites" ON public.favorites
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can add favorites" ON public.favorites
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can remove their own favorites" ON public.favorites
    FOR DELETE USING ((select auth.uid()) = user_id);

-- =============================================
-- OPTIMIZED ORDERS POLICIES (CONSOLIDATED)
-- =============================================

-- Consolidated SELECT policy for orders (combines buyer + seller access)
CREATE POLICY "Users can view relevant orders" ON public.orders
    FOR SELECT USING (
        (select auth.uid()) = buyer_id OR    -- Buyers can view their orders
        (select auth.uid()) = seller_id      -- Sellers can view orders for their listings
    );

CREATE POLICY "Buyers can create orders" ON public.orders
    FOR INSERT WITH CHECK ((select auth.uid()) = buyer_id);

CREATE POLICY "Buyers can update their own orders" ON public.orders
    FOR UPDATE USING ((select auth.uid()) = buyer_id);

-- =============================================
-- OPTIMIZED USER ANALYTICS POLICIES
-- =============================================

CREATE POLICY "Users can view their own analytics" ON public.user_analytics
    FOR SELECT USING ((select auth.uid()) = user_id);

-- =============================================
-- VERIFICATION
-- =============================================

-- Check that all policies are optimized
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'listings', 'messages', 'favorites', 'orders', 'user_analytics')
ORDER BY tablename, cmd, policyname;

-- Verify no multiple permissive policies remain
SELECT 
    tablename,
    cmd,
    COUNT(*) as policy_count,
    array_agg(policyname) as policies
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'orders')
AND permissive = 't'
GROUP BY tablename, cmd
HAVING COUNT(*) > 1;

SELECT 'RLS Performance Optimization Complete! ✅' as status,
       'Auth functions now use SELECT subqueries for better performance' as improvement,
       'Multiple permissive policies consolidated' as consolidation;