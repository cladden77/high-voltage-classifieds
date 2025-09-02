-- DIAGNOSE POLICY MESS
-- This script will show you exactly what policies exist and why they're multiplying

-- =============================================
-- STEP 1: SHOW ALL EXISTING POLICIES
-- =============================================

SELECT '=== ALL ORDERS POLICIES ===' as section;
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual
FROM pg_policies 
WHERE tablename = 'orders' 
ORDER BY policyname;

SELECT '=== ALL USERS POLICIES ===' as section;
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual
FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY policyname;

-- =============================================
-- STEP 2: COUNT POLICIES BY ACTION
-- =============================================

SELECT '=== POLICY COUNTS BY ACTION ===' as section;
SELECT 
    tablename,
    cmd,
    COUNT(*) as policy_count,
    array_agg(policyname) as policy_names
FROM pg_policies 
WHERE tablename IN ('orders', 'users')
GROUP BY tablename, cmd
ORDER BY tablename, cmd;

-- =============================================
-- STEP 3: IDENTIFY MULTIPLE PERMISSIVE POLICIES
-- =============================================

SELECT '=== MULTIPLE PERMISSIVE POLICIES ===' as section;
SELECT 
    tablename,
    cmd,
    COUNT(*) as policy_count,
    array_agg(policyname) as policy_names
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('orders', 'users')
    AND cmd IN ('UPDATE', 'SELECT', 'INSERT')
GROUP BY tablename, cmd
HAVING COUNT(*) > 1
ORDER BY tablename, cmd;

-- =============================================
-- STEP 4: SHOW POLICY DETAILS FOR PROBLEMATIC ONES
-- =============================================

SELECT '=== DETAILS OF PROBLEMATIC POLICIES ===' as section;
SELECT 
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('orders', 'users')
    AND cmd IN ('UPDATE', 'SELECT', 'INSERT')
    AND policyname IN (
        SELECT policyname
        FROM pg_policies 
        WHERE schemaname = 'public' 
            AND tablename IN ('orders', 'users')
            AND cmd IN ('UPDATE', 'SELECT', 'INSERT')
        GROUP BY tablename, cmd, policyname
        HAVING COUNT(*) > 1
    )
ORDER BY tablename, cmd, policyname;

-- =============================================
-- STEP 5: SUMMARY
-- =============================================

SELECT '=== SUMMARY ===' as section;
SELECT 
    'Total orders policies:' as metric,
    COUNT(*) as value
FROM pg_policies WHERE tablename = 'orders'
UNION ALL
SELECT 
    'Total users policies:' as metric,
    COUNT(*) as value
FROM pg_policies WHERE tablename = 'users'
UNION ALL
SELECT 
    'Multiple permissive policies:' as metric,
    COUNT(*) as value
FROM (
    SELECT tablename, cmd
    FROM pg_policies 
    WHERE schemaname = 'public' 
        AND tablename IN ('orders', 'users')
        AND cmd IN ('UPDATE', 'SELECT', 'INSERT')
    GROUP BY tablename, cmd
    HAVING COUNT(*) > 1
) as multiple_policies;
