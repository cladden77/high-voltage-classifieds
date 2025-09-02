-- EMERGENCY POLICY CLEANUP
-- This script will identify and remove ALL problematic policies

-- =============================================
-- STEP 1: IDENTIFY ALL EXISTING POLICIES
-- =============================================

SELECT 'Current orders policies:' as table_name;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'orders' ORDER BY policyname;

SELECT 'Current users policies:' as table_name;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users' ORDER BY policyname;

-- =============================================
-- STEP 2: DROP ALL POLICIES (NUCLEAR OPTION)
-- =============================================

-- Drop ALL orders policies
DROP POLICY IF EXISTS "System can update orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users and system can update orders" ON public.orders;
DROP POLICY IF EXISTS "Buyers can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Optimized orders update policy" ON public.orders;
DROP POLICY IF EXISTS "Users can view relevant orders" ON public.orders;
DROP POLICY IF EXISTS "Buyers can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "orders_update_only" ON public.orders;
DROP POLICY IF EXISTS "orders_select_only" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_only" ON public.orders;
DROP POLICY IF EXISTS "orders_select" ON public.orders;
DROP POLICY IF EXISTS "orders_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_update" ON public.orders;

-- Drop ALL users policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view profiles for messaging" ON public.users;
DROP POLICY IF EXISTS "Users can view profiles" ON public.users;
DROP POLICY IF EXISTS "Optimized users select policy" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "users_select_only" ON public.users;
DROP POLICY IF EXISTS "users_update_only" ON public.users;
DROP POLICY IF EXISTS "users_insert_only" ON public.users;
DROP POLICY IF EXISTS "users_select" ON public.users;
DROP POLICY IF EXISTS "users_insert" ON public.users;
DROP POLICY IF EXISTS "users_update" ON public.users;

-- =============================================
-- STEP 3: VERIFY ALL POLICIES ARE GONE
-- =============================================

SELECT 'Verifying all policies are removed:' as verification_step;
SELECT COUNT(*) as remaining_orders_policies FROM pg_policies WHERE tablename = 'orders';
SELECT COUNT(*) as remaining_users_policies FROM pg_policies WHERE tablename = 'users';

-- =============================================
-- STEP 4: CREATE SINGLE CLEAN POLICIES
-- =============================================

-- Orders: Single policy per action
CREATE POLICY "orders_select_policy" ON public.orders
    FOR SELECT USING (
        (select auth.uid()) = buyer_id OR 
        (select auth.uid()) = seller_id
    );

CREATE POLICY "orders_insert_policy" ON public.orders
    FOR INSERT WITH CHECK (
        (select auth.uid()) = buyer_id
    );

CREATE POLICY "orders_update_policy" ON public.orders
    FOR UPDATE USING (
        (select auth.uid()) = buyer_id OR 
        (select auth.uid()) = seller_id OR 
        (select auth.role()) = 'service_role'
    );

-- Users: Single policy per action
CREATE POLICY "users_select_policy" ON public.users
    FOR SELECT USING (
        (select auth.uid()) = id OR 
        true
    );

CREATE POLICY "users_insert_policy" ON public.users
    FOR INSERT WITH CHECK (
        (select auth.uid()) = id
    );

CREATE POLICY "users_update_policy" ON public.users
    FOR UPDATE USING (
        (select auth.uid()) = id
    );

-- =============================================
-- STEP 5: FINAL VERIFICATION
-- =============================================

SELECT 'Final policy count:' as final_check;
SELECT 
    tablename,
    cmd,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN ('orders', 'users')
GROUP BY tablename, cmd
ORDER BY tablename, cmd;

SELECT 'Multiple permissive policies check (should be empty):' as multiple_check;
SELECT 
    tablename,
    cmd,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('orders', 'users')
    AND cmd IN ('UPDATE', 'SELECT', 'INSERT')
GROUP BY tablename, cmd
HAVING COUNT(*) > 1;

-- =============================================
-- SUCCESS
-- =============================================

SELECT 'EMERGENCY CLEANUP COMPLETED! All policies reset! ✅' as status;
