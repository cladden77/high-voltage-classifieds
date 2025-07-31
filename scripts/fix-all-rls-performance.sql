-- Fix All RLS Performance Issues
-- This script addresses Supabase performance warnings about auth.uid() re-evaluation
-- Run this in your Supabase SQL Editor

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

-- Recreate policies with optimized auth.uid() calls
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING ((select auth.uid()) = user_id);

-- ============================================================================
-- USERS TABLE
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Recreate policies with optimized auth.uid() calls
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK ((select auth.uid()) = id);

-- ============================================================================
-- LISTINGS TABLE
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can update own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can delete own listings" ON public.listings;

-- Recreate policies with optimized auth.uid() calls
CREATE POLICY "Users can insert own listings" ON public.listings
    FOR INSERT WITH CHECK ((select auth.uid()) = seller_id);

CREATE POLICY "Users can update own listings" ON public.listings
    FOR UPDATE USING ((select auth.uid()) = seller_id);

CREATE POLICY "Users can delete own listings" ON public.listings
    FOR DELETE USING ((select auth.uid()) = seller_id);

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;

-- Recreate policies with optimized auth.uid() calls
CREATE POLICY "Users can view own messages" ON public.messages
    FOR SELECT USING (
        (select auth.uid()) = sender_id OR
        (select auth.uid()) = recipient_id
    );

CREATE POLICY "Users can insert own messages" ON public.messages
    FOR INSERT WITH CHECK ((select auth.uid()) = sender_id);

CREATE POLICY "Users can update own messages" ON public.messages
    FOR UPDATE USING ((select auth.uid()) = sender_id);

-- ============================================================================
-- FAVORITES TABLE
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;

-- Recreate policies with optimized auth.uid() calls
CREATE POLICY "Users can view own favorites" ON public.favorites
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own favorites" ON public.favorites
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own favorites" ON public.favorites
    FOR DELETE USING ((select auth.uid()) = user_id);

-- ============================================================================
-- ORDERS TABLE (if exists)
-- ============================================================================

-- Only modify orders table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
        DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
        DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;

        -- Recreate policies with optimized auth.uid() calls
        CREATE POLICY "Users can view own orders" ON public.orders
            FOR SELECT USING (
                (select auth.uid()) = buyer_id OR    -- Buyers can view their orders
                (select auth.uid()) = seller_id      -- Sellers can view orders for their listings
            );

        CREATE POLICY "Users can insert own orders" ON public.orders
            FOR INSERT WITH CHECK ((select auth.uid()) = buyer_id);

        CREATE POLICY "Users can update own orders" ON public.orders
            FOR UPDATE USING ((select auth.uid()) = buyer_id);
    END IF;
END $$;

-- ============================================================================
-- PAYMENTS TABLE (if exists)
-- ============================================================================

-- Only modify payments table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payments') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;

        -- Recreate policies with optimized auth.uid() calls
        CREATE POLICY "Users can view own payments" ON public.payments
            FOR SELECT USING ((select auth.uid()) = user_id);
    END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify all policies were updated correctly
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname; 