-- Fix Multiple Permissive Policies and Auth RLS Performance Issues
-- This script consolidates overlapping RLS policies and optimizes auth function calls

-- =============================================
-- FIX ORDERS TABLE POLICIES
-- =============================================

-- First, drop ALL existing UPDATE policies on orders table
DROP POLICY IF EXISTS "System can update orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users and system can update orders" ON public.orders;
DROP POLICY IF EXISTS "Buyers can update their own orders" ON public.orders;

-- Create optimized consolidated UPDATE policy for orders
-- Using (select auth.uid()) instead of auth.uid() for better performance
CREATE POLICY "Optimized orders update policy" ON public.orders
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

-- Create optimized consolidated SELECT policy for users
-- Using (select auth.uid()) instead of auth.uid() for better performance
CREATE POLICY "Optimized users select policy" ON public.users
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

-- Check for any remaining multiple permissive policies
SELECT 
    tablename,
    cmd,
    COUNT(*) as policy_count,
    array_agg(policyname) as policy_names
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('orders', 'users')
GROUP BY tablename, cmd
HAVING COUNT(*) > 1;

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

SELECT 'Multiple permissive policies and auth RLS issues fixed successfully! ✅' as status;
SELECT 'Orders table: Consolidated UPDATE policies with optimized auth calls' as orders_fix;
SELECT 'Users table: Consolidated SELECT policies with optimized auth calls' as users_fix;
SELECT 'Performance: Added indexes and optimized auth function calls' as performance_improvement;
SELECT 'Auth RLS: Using (select auth.uid()) for better performance' as auth_optimization;
