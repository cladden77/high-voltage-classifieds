-- =============================================
-- TEST NOTIFICATIONS SYSTEM SETUP
-- =============================================
-- Run this script to verify the notifications system is working

-- Check if notifications table exists and has correct structure
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'notifications';

-- Check table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  ordinal_position
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;

-- Check if create_notification function exists
SELECT 
  proname,
  proargtypes,
  proargnames,
  prosrc
FROM pg_proc 
WHERE proname = 'create_notification';

-- Test creating a notification manually
DO $$
DECLARE
  test_user_id UUID;
  notification_id UUID;
BEGIN
  -- Get a test user ID (replace with actual user email if needed)
  SELECT id INTO test_user_id FROM public.users LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Test the create_notification function
    SELECT create_notification(
      test_user_id,
      'Test Notification',
      'This is a test notification to verify the system is working.',
      'info',
      'test-123',
      'test'
    ) INTO notification_id;
    
    RAISE NOTICE 'Test notification created with ID: %', notification_id;
    
    -- Check if it was actually created
    IF EXISTS (SELECT 1 FROM public.notifications WHERE id = notification_id) THEN
      RAISE NOTICE '✅ Notification system is working correctly!';
    ELSE
      RAISE NOTICE '❌ Notification was not created in the table';
    END IF;
    
    -- Clean up test notification
    DELETE FROM public.notifications WHERE id = notification_id;
    RAISE NOTICE 'Test notification cleaned up';
    
  ELSE
    RAISE NOTICE '❌ No users found in the database to test with';
  END IF;
END $$;

-- Show current notifications count
SELECT COUNT(*) as total_notifications FROM public.notifications;
