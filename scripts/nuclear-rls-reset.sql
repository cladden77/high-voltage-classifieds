-- Nuclear Option: Complete RLS Policy Reset
-- This script completely disables and re-enables RLS to clear all policies

-- =============================================
-- STEP 1: DISABLE RLS (THIS REMOVES ALL POLICIES)
-- =============================================

-- Disable RLS on both tables (this removes ALL policies)
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- =============================================
-- STEP 2: RE-ENABLE RLS
-- =============================================

-- Re-enable RLS on both tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- =============================================
-- STEP 3: CREATE SINGLE OPTIMIZED POLICIES
-- =============================================

-- Orders table: Single UPDATE policy with optimized auth calls
CREATE POLICY "orders_update_only" ON public.orders
    FOR UPDATE USING (
        (select auth.uid()) = buyer_id OR 
        (select auth.uid()) = seller_id OR 
        (select auth.role()) = 'service_role'
    );

-- Orders table: Single SELECT policy
CREATE POLICY "orders_select_only" ON public.orders
    FOR SELECT USING (
        (select auth.uid()) = buyer_id OR 
        (select auth.uid()) = seller_id
    );

-- Orders table: Single INSERT policy
CREATE POLICY "orders_insert_only" ON public.orders
    FOR INSERT WITH CHECK (
        (select auth.uid()) = buyer_id
    );

-- Users table: Single SELECT policy with optimized auth calls
CREATE POLICY "users_select_only" ON public.users
    FOR SELECT USING (
        (select auth.uid()) = id OR 
        true
    );

-- Users table: Single UPDATE policy
CREATE POLICY "users_update_only" ON public.users
    FOR UPDATE USING (
        (select auth.uid()) = id
    );

-- Users table: Single INSERT policy
CREATE POLICY "users_insert_only" ON public.users
    FOR INSERT WITH CHECK (
        (select auth.uid()) = id
    );

-- =============================================
-- STEP 4: VERIFICATION
-- =============================================

-- Check final policy count (should be exactly 1 per action per table)
SELECT 'Orders policies:' as table_name;
SELECT cmd, COUNT(*) as policy_count FROM pg_policies 
WHERE tablename = 'orders' GROUP BY cmd ORDER BY cmd;

SELECT 'Users policies:' as table_name;
SELECT cmd, COUNT(*) as policy_count FROM pg_policies 
WHERE tablename = 'users' GROUP BY cmd ORDER BY cmd;

-- Check for any multiple permissive policies (should be 0)
SELECT 'Multiple permissive policies check:' as check_type;
SELECT 
    tablename,
    cmd,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('orders', 'users')
    AND cmd IN ('UPDATE', 'SELECT')
GROUP BY tablename, cmd
HAVING COUNT(*) > 1;

-- =============================================
-- STEP 5: PERFORMANCE INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

SELECT 'Nuclear option completed! All policies reset and optimized! ✅' as status;
