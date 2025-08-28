-- =============================================
-- CHECK DATABASE SCHEMA FOR SELLER CAPABILITIES
-- =============================================
-- Run this script to verify the new fields exist

-- Check if the new fields exist in the users table
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  CASE 
    WHEN column_name IN ('can_sell', 'seller_verified', 'seller_verification_date') 
    THEN '✅ NEW FIELD' 
    ELSE '📋 EXISTING FIELD' 
  END as status
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY column_name;

-- Check if the new indexes exist
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE tablename = 'users' 
  AND indexname LIKE '%can_sell%' 
   OR indexname LIKE '%seller_verified%';

-- Check current user data to see if new fields have values
SELECT 
  id,
  email,
  full_name,
  role,
  can_sell,
  seller_verified,
  seller_verification_date,
  stripe_account_id
FROM public.users 
LIMIT 3;

-- Check if there are any users with NULL values in new fields
SELECT 
  COUNT(*) as total_users,
  COUNT(can_sell) as users_with_can_sell,
  COUNT(seller_verified) as users_with_seller_verified,
  COUNT(seller_verification_date) as users_with_verification_date
FROM public.users;

