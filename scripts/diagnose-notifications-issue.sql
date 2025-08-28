-- =============================================
-- DIAGNOSE NOTIFICATIONS TABLE ISSUE
-- =============================================
-- Run this script to understand what's happening with the notifications table

-- Check if notifications table exists
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'notifications';

-- If table exists, check its current structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;

-- Check if there are any constraints
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'notifications';

-- Check if there are any indexes
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename = 'notifications';

-- Check if the create_notification function exists
SELECT 
    proname,
    proargtypes,
    proargnames,
    prosrc
FROM pg_proc 
WHERE proname = 'create_notification';

-- Check for any existing notifications data
SELECT COUNT(*) as notification_count FROM public.notifications;
