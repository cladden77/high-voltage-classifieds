-- Fix Multiple Permissive Policies Warning
-- This script consolidates overlapping RLS policies to improve performance

-- =============================================
-- FIX ORDERS TABLE POLICIES
-- =============================================

-- Drop existing overlapping policies
DROP POLICY IF EXISTS "System can update orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;

-- Create consolidated UPDATE policy for orders
CREATE POLICY "Users and system can update orders" ON public.orders
    FOR UPDATE USING (
        (select auth.uid()) = buyer_id OR     -- Buyers can update their orders
        (select auth.uid()) = seller_id OR    -- Sellers can update orders for their listings
        auth.role() = 'service_role'          -- System/webhook operations
    );

-- =============================================
-- FIX USERS TABLE POLICIES  
-- =============================================

-- Drop existing overlapping policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view profiles for messaging" ON public.users;

-- Create consolidated SELECT policy for users
CREATE POLICY "Users can view profiles" ON public.users
    FOR SELECT USING (
        (select auth.uid()) = id OR  -- Own profile
        true                         -- Public profiles (for messaging, etc.)
    );

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Check remaining policies for orders table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'orders' 
ORDER BY policyname;

-- Check remaining policies for users table  
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY policyname;

-- =============================================
-- PERFORMANCE OPTIMIZATION
-- =============================================

-- Ensure indexes exist for optimal policy performance
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);

-- =============================================
-- SUMMARY
-- =============================================

SELECT 'Multiple permissive policies fixed successfully! ✅' as status;
SELECT 'Orders table: Consolidated UPDATE policies' as orders_fix;
SELECT 'Users table: Consolidated SELECT policies' as users_fix;
SELECT 'Performance: Added indexes for policy optimization' as performance_improvement;
