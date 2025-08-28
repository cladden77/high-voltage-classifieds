-- =============================================
-- TEST SELLER CAPABILITIES FUNCTIONALITY
-- =============================================
-- Run this script to test the new seller capabilities fields

-- Check if the new fields exist
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('can_sell', 'seller_verified', 'seller_verification_date')
ORDER BY column_name;

-- Check current user data structure
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
LIMIT 5;

-- Test updating a user to enable seller capabilities
-- (Replace 'USER_EMAIL_HERE' with an actual user email from your system)
UPDATE public.users 
SET can_sell = TRUE
WHERE email = 'test@example.com'  -- Replace with actual email
  AND can_sell IS NULL;

-- Verify the update
SELECT 
  email,
  can_sell,
  seller_verified,
  seller_verification_date
FROM public.users 
WHERE email = 'test@example.com';  -- Replace with actual email
