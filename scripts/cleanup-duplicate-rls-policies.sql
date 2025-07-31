-- Cleanup Duplicate RLS Policies
-- This script removes duplicate policies and keeps only the optimized ones
-- Run this in your Supabase SQL Editor

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================

-- Drop ALL existing policies for notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

-- Recreate only the optimized policies
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING ((select auth.uid()) = user_id);

-- ============================================================================
-- USERS TABLE
-- ============================================================================

-- Drop ALL existing policies for users
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Recreate only the optimized policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK ((select auth.uid()) = id);

-- ============================================================================
-- LISTINGS TABLE
-- ============================================================================

-- Drop ALL existing policies for listings
DROP POLICY IF EXISTS "Users can insert own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can update own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can delete own listings" ON public.listings;
DROP POLICY IF EXISTS "Sellers can create listings" ON public.listings;
DROP POLICY IF EXISTS "Sellers can update their own listings" ON public.listings;
DROP POLICY IF EXISTS "Sellers can delete their own listings" ON public.listings;

-- Recreate only the optimized policies
CREATE POLICY "Users can insert own listings" ON public.listings
    FOR INSERT WITH CHECK ((select auth.uid()) = seller_id);

CREATE POLICY "Users can update own listings" ON public.listings
    FOR UPDATE USING ((select auth.uid()) = seller_id);

CREATE POLICY "Users can delete own listings" ON public.listings
    FOR DELETE USING ((select auth.uid()) = seller_id);

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================

-- Drop ALL existing policies for messages
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own sent messages" ON public.messages;

-- Recreate only the optimized policies
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

-- Drop ALL existing policies for favorites
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can add favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can remove their own favorites" ON public.favorites;

-- Recreate only the optimized policies
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
        -- Drop ALL existing policies for orders
        DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
        DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
        DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
        DROP POLICY IF EXISTS "Users can view relevant orders" ON public.orders;
        DROP POLICY IF EXISTS "Buyers can create orders" ON public.orders;
        DROP POLICY IF EXISTS "Buyers can update their own orders" ON public.orders;

        -- Recreate only the optimized policies
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
        -- Drop ALL existing policies for payments
        DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
        DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;

        -- Recreate only the optimized policies
        CREATE POLICY "Users can view own payments" ON public.payments
            FOR SELECT USING ((select auth.uid()) = user_id);
    END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify all policies were cleaned up correctly
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

-- Show count of policies per table to confirm cleanup
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename; 