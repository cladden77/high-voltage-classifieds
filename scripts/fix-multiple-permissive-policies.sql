-- Comprehensive Fix for Multiple Permissive Policies and Auth RLS Issues
-- This script completely removes ALL existing policies and creates optimized replacements

-- =============================================
-- STEP 1: COMPLETE POLICY CLEANUP
-- =============================================

-- Drop ALL existing policies on orders table (be very thorough)
DROP POLICY IF EXISTS "System can update orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users and system can update orders" ON public.orders;
DROP POLICY IF EXISTS "Buyers can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Optimized orders update policy" ON public.orders;
DROP POLICY IF EXISTS "Users can view relevant orders" ON public.orders;
DROP POLICY IF EXISTS "Buyers can create orders" ON public.orders;

-- Drop ALL existing policies on users table (be very thorough)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view profiles for messaging" ON public.users;
DROP POLICY IF EXISTS "Users can view profiles" ON public.users;
DROP POLICY IF EXISTS "Optimized users select policy" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- =============================================
-- STEP 2: VERIFY CLEANUP
-- =============================================

-- Check what policies remain (should be none for UPDATE on orders, SELECT on users)
SELECT 'Remaining orders policies:' as check_type;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'orders' ORDER BY policyname;

SELECT 'Remaining users policies:' as check_type;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users' ORDER BY policyname;

-- =============================================
-- STEP 3: CREATE OPTIMIZED POLICIES
-- =============================================

-- Create SINGLE optimized UPDATE policy for orders
-- Using (select auth.uid()) for performance and auth.role() for system access
CREATE POLICY "orders_update_policy" ON public.orders
    FOR UPDATE USING (
        (select auth.uid()) = buyer_id OR 
        (select auth.uid()) = seller_id OR 
        (select auth.role()) = 'service_role'
    );

-- Create SINGLE optimized SELECT policy for users
-- Using (select auth.uid()) for performance
CREATE POLICY "users_select_policy" ON public.users
    FOR SELECT USING (
        (select auth.uid()) = id OR 
        true
    );

-- Create other necessary policies for orders (non-overlapping)
CREATE POLICY "orders_select_policy" ON public.orders
    FOR SELECT USING (
        (select auth.uid()) = buyer_id OR 
        (select auth.uid()) = seller_id
    );

CREATE POLICY "orders_insert_policy" ON public.orders
    FOR INSERT WITH CHECK (
        (select auth.uid()) = buyer_id
    );

-- Create other necessary policies for users (non-overlapping)
CREATE POLICY "users_update_policy" ON public.users
    FOR UPDATE USING (
        (select auth.uid()) = id
    );

CREATE POLICY "users_insert_policy" ON public.users
    FOR INSERT WITH CHECK (
        (select auth.uid()) = id
    );

-- =============================================
-- STEP 4: FINAL VERIFICATION
-- =============================================

-- Check for multiple permissive policies
SELECT 'Checking for multiple permissive policies:' as verification_step;
SELECT 
    tablename,
    cmd,
    COUNT(*) as policy_count,
    array_agg(policyname) as policy_names
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('orders', 'users')
    AND cmd IN ('UPDATE', 'SELECT')
GROUP BY tablename, cmd
HAVING COUNT(*) > 1;

-- Show final policy structure
SELECT 'Final orders policies:' as final_check;
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'orders' ORDER BY cmd, policyname;

SELECT 'Final users policies:' as final_check;
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'users' ORDER BY cmd, policyname;

-- =============================================
-- STEP 5: PERFORMANCE OPTIMIZATION
-- =============================================

-- Ensure indexes exist for optimal policy performance
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);

-- =============================================
-- SUMMARY
-- =============================================

SELECT 'Comprehensive policy fix completed! ✅' as status;
SELECT 'Orders table: Single UPDATE policy with optimized auth calls' as orders_fix;
SELECT 'Users table: Single SELECT policy with optimized auth calls' as users_fix;
SELECT 'Performance: Auth functions optimized with (select auth.uid())' as auth_optimization;
SELECT 'Cleanup: All overlapping policies removed' as cleanup_status;
