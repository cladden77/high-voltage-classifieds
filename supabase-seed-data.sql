-- =============================================
-- HIGH VOLTAGE CLASSIFIEDS SEED DATA
-- =============================================
-- Run this AFTER setting up the main schema and creating auth users
-- Replace the UUIDs below with actual user IDs from your Supabase Auth

-- =============================================
-- SAMPLE LISTINGS DATA
-- =============================================

-- Sample categories used in the platform
-- Note: You'll need to replace the seller_id UUIDs with real auth user IDs

-- Example: After creating auth users, insert their profiles and listings
-- Step 1: Create auth users via your app's signup form
-- Step 2: Copy their UUIDs from Supabase Auth dashboard  
-- Step 3: Replace the placeholder UUIDs below
-- Step 4: Run this seed data script

-- Sample user profiles (replace UUIDs with real auth user IDs)
-- Uncomment and modify these after creating real auth users:


-- Sample Seller Profile
INSERT INTO public.users (
    id, 
    full_name, 
    email, 
    role, 
    location, 
    bio, 
    company_name,
    phone,
    is_verified
) VALUES (
    '675cc100-36ff-451d-af54-334ad1237dd2', -- Replace with real auth user ID
    'Seller Chris', 
    'chris.ladden+seller@gmail.com', 
    'seller', 
    'Los Angeles, CA', 
    'Electrical contractor with 15+ years experience in high voltage equipment. Specializing in industrial transformers and switchgear.',
    'Smith Electric Solutions',
    '+1 (555) 123-4567',
    true
);

-- Sample Buyer Profile  
INSERT INTO public.users (
    id,
    full_name,
    email, 
    role,
    location,
    bio,
    company_name,
    phone
) VALUES (
    'd1b4016b-28f7-4c98-bc3f-5eda70f933ef', -- Replace with real auth user ID
    'Buyer Chris',
    'chris.ladden+buyer@gmail.com',
    'buyer', 
    'Phoenix, AZ',
    'Procurement manager for solar installations. Always looking for quality used equipment.',
    'SolarTech Solutions',
    '+1 (555) 987-6543'
);


-- Sample listings (update seller_id with real UUIDs)
INSERT INTO public.listings (
    title,
    description,
    price,
    location,
    category,
    condition,
    seller_id,
    is_featured
) VALUES 
(
    '500 kVA Padmount Transformer',
    'Excellent condition 500 kVA padmount transformer, recently removed from service. Tested and certified. Primary: 13.8kV, Secondary: 480V. Includes all documentation and test reports. Perfect for industrial applications or solar farms.',
    15000.00,
    'Los Angeles, CA',
    'Transformers',
    'good',
    '675cc100-36ff-451d-af54-334ad1237dd2', -- Replace with real seller ID
    true
),
(
    'Square D 800A Switchgear',
    'Square D Model 6 Metal Clad Switchgear, 800A main breaker. 4.16kV class. Recently serviced with new control wiring. Includes 6 feeder breakers. Ideal for manufacturing facilities.',
    28000.00,
    'Dallas, TX', 
    'Switchgear',
    'like_new',
    '675cc100-36ff-451d-af54-334ad1237dd2', -- Replace with real seller ID
    false
),
(
    'Siemens 150 HP Motor',
    'Siemens TEFC motor, 150 HP, 460V, 1800 RPM. Excellent condition, recently rebuilt. Includes mounting hardware and documentation. Great for pumps, compressors, or conveyors.',
    8500.00,
    'Houston, TX',
    'Motors', 
    'good',
    '675cc100-36ff-451d-af54-334ad1237dd2', -- Replace with real seller ID
    false
),
(
    'Allen Bradley VFD Panel',
    'Allen Bradley PowerFlex 755 Variable Frequency Drive panel. 200 HP, 480V. Includes HMI interface and bypass contactor. Perfect condition, surplus from cancelled project.',
    12000.00,
    'Chicago, IL',
    'Panels',
    'new',
    '675cc100-36ff-451d-af54-334ad1237dd2', -- Replace with real seller ID
    true
),
(
    '1000 MCM Copper Cable',
    '500 feet of 1000 MCM copper cable, 15kV insulation. Never installed, still on original reels. Perfect for underground distribution or large motor feeders.',
    4500.00,
    'Denver, CO',
    'Cables',
    'new',
    '675cc100-36ff-451d-af54-334ad1237dd2', -- Replace with real seller ID
    false
),
(
    'Caterpillar 500kW Generator',
    'CAT 3512B diesel generator, 500kW standby rated. Low hours, well maintained. Includes transfer switch and control panel. Perfect for emergency backup or temporary power.',
    45000.00,
    'Miami, FL',
    'Generators',
    'good',
    '675cc100-36ff-451d-af54-334ad1237dd2', -- Replace with real seller ID
    true
);

-- Sample favorites (buyer favoriting some listings)
INSERT INTO public.favorites (user_id, listing_id) 
SELECT 
    'd1b4016b-28f7-4c98-bc3f-5eda70f933ef', -- Replace with real buyer ID
    id 
FROM public.listings 
WHERE title IN ('500 kVA Padmount Transformer', 'Caterpillar 500kW Generator')
LIMIT 2;

-- Sample messages (conversation between buyer and seller)
INSERT INTO public.messages (sender_id, recipient_id, listing_id, message_text) VALUES
(
    'd1b4016b-28f7-4c98-bc3f-5eda70f933ef', -- Buyer ID
    '675cc100-36ff-451d-af54-334ad1237dd2', -- Seller ID  
    (SELECT id FROM public.listings WHERE title = '500 kVA Padmount Transformer' LIMIT 1),
    'Hi! I''m interested in this transformer. Can you provide more details about the test reports and when it was last in service?'
),
(
    '675cc100-36ff-451d-af54-334ad1237dd2', -- Seller ID
    'd1b4016b-28f7-4c98-bc3f-5eda70f933ef', -- Buyer ID
    (SELECT id FROM public.listings WHERE title = '500 kVA Padmount Transformer' LIMIT 1), 
    'Hello! Thanks for your interest. The transformer was removed from service just 3 months ago due to a facility upgrade. All test reports are current and show excellent insulation resistance. I can email you the detailed reports if you''d like.'
),
(
    'd1b4016b-28f7-4c98-bc3f-5eda70f933ef', -- Buyer ID
    '675cc100-36ff-451d-af54-334ad1237dd2', -- Seller ID
    (SELECT id FROM public.listings WHERE title = '500 kVA Padmount Transformer' LIMIT 1),
    'That would be great! My email is sarah.johnson@example.com. Also, would you be open to a site inspection before purchase?'
),
(
    '675cc100-36ff-451d-af54-334ad1237dd2', -- Seller ID  
    'd1b4016b-28f7-4c98-bc3f-5eda70f933ef', -- Buyer ID
    (SELECT id FROM public.listings WHERE title = '500 kVA Padmount Transformer' LIMIT 1),
    'Absolutely! Site inspections are always welcome. I''ll send the reports to your email within the hour. When would work best for you to visit?'
);

-- Sample user analytics
INSERT INTO public.user_analytics (user_id, listings_count, sales_count, total_revenue) VALUES
(
    '675cc100-36ff-451d-af54-334ad1237dd2', -- Seller ID
    6, -- Number of listings
    0, -- Sales count (no sales yet)
    0.00 -- Total revenue
);

-- =============================================
-- UTILITY QUERIES FOR TESTING
-- =============================================

-- Query to check all data after seeding
/*
-- View all users
SELECT * FROM public.users;

-- View all listings with seller info  
SELECT * FROM listing_details ORDER BY created_at DESC;

-- View all messages
SELECT 
    m.*,
    sender.full_name as sender_name,
    recipient.full_name as recipient_name,
    l.title as listing_title
FROM public.messages m
JOIN public.users sender ON m.sender_id = sender.id
JOIN public.users recipient ON m.recipient_id = recipient.id
LEFT JOIN public.listings l ON m.listing_id = l.id
ORDER BY m.created_at;

-- View all favorites
SELECT 
    f.*,
    u.full_name as user_name,
    l.title as listing_title,
    l.price
FROM public.favorites f
JOIN public.users u ON f.user_id = u.id  
JOIN public.listings l ON f.listing_id = l.id;

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'listing-images';
*/

-- =============================================
-- DEVELOPMENT HELPER FUNCTIONS
-- =============================================

-- Function to clear all data (useful for development)
CREATE OR REPLACE FUNCTION clear_all_data()
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.orders;
    DELETE FROM public.messages;
    DELETE FROM public.favorites;
    DELETE FROM public.listings;
    DELETE FROM public.user_analytics;
    -- Note: Don't delete users as they're tied to auth.users
    RAISE NOTICE 'All listing data cleared successfully';
END;
$$ LANGUAGE plpgsql;

-- Function to get platform statistics
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS TABLE(
    total_users BIGINT,
    total_listings BIGINT,
    total_active_listings BIGINT,
    total_messages BIGINT,
    total_favorites BIGINT,
    total_orders BIGINT
) AS $$
BEGIN
    RETURN QUERY SELECT
        (SELECT COUNT(*) FROM public.users) as total_users,
        (SELECT COUNT(*) FROM public.listings) as total_listings,
        (SELECT COUNT(*) FROM public.listings WHERE is_sold = false) as total_active_listings,
        (SELECT COUNT(*) FROM public.messages) as total_messages,
        (SELECT COUNT(*) FROM public.favorites) as total_favorites,
        (SELECT COUNT(*) FROM public.orders) as total_orders;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- INSTRUCTIONS FOR USE
-- =============================================
/*
TO USE THIS SEED DATA:

1. First run the main schema (supabase-schema.sql)
2. Create 2 test users via your app's signup:
   - One seller account  
   - One buyer account
3. Go to Supabase Dashboard > Authentication > Users
4. Copy the user IDs
5. Replace the placeholder UUIDs in this file with real IDs
6. Uncomment the user profile INSERT statements
7. Run this seed data script
8. Test your application with real data!

The seed data includes:
- 6 sample listings across different categories
- 2 user profiles (seller and buyer)
- 4 messages in a conversation thread
- 2 favorites for the buyer
- Analytics data for the seller

This gives you a realistic dataset to test all features of your classifieds platform.
*/ 