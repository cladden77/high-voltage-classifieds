-- Production Fix: Identify and resolve listings with missing seller users
-- This script fixes data integrity issues where listings reference non-existent users

-- Step 1: Identify the problem
-- Show all listings where the seller_id doesn't exist in the users table
SELECT 
    l.id as listing_id,
    l.title,
    l.seller_id,
    l.created_at,
    'MISSING USER' as status
FROM listings l
LEFT JOIN users u ON l.seller_id = u.id
WHERE u.id IS NULL;

-- Step 2: Show existing users to choose from
SELECT 
    id, 
    email, 
    full_name, 
    role, 
    created_at 
FROM users 
WHERE role = 'seller'
ORDER BY created_at DESC;

-- Step 3: Fix the data by updating the listing to point to a valid seller
-- Replace 'VALID_SELLER_USER_ID' with an actual seller user ID from the above query
UPDATE listings 
SET seller_id = 'VALID_SELLER_USER_ID'
WHERE seller_id = '675cc100-36ff-451d-af54-334ad1237dd2';

-- Step 4: Verify the fix
SELECT 
    l.id as listing_id,
    l.title,
    l.seller_id,
    u.full_name as seller_name,
    u.email as seller_email,
    'FIXED' as status
FROM listings l
JOIN users u ON l.seller_id = u.id
WHERE l.id = '65261520-b7c1-422f-9676-fb3d6bb3b077';

-- Alternative: If you want to delete orphaned listings instead
-- DELETE FROM listings WHERE seller_id = '675cc100-36ff-451d-af54-334ad1237dd2';
