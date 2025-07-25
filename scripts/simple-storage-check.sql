-- =============================================
-- SIMPLE STORAGE VERIFICATION SCRIPT
-- =============================================
-- This script only CHECKS your current setup without making changes

-- 1. Check if the bucket exists
SELECT 
    b.id as bucket_id,
    b.name as bucket_name,
    b.public as is_public,
    b.created_at
FROM storage.buckets b 
WHERE b.id = 'listing-images';

-- 2. Check existing policies for the storage.objects table
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND (qual LIKE '%listing-images%' OR with_check LIKE '%listing-images%');

-- 3. If the bucket exists but policies are missing, run this simple version:
-- (Uncomment the lines below if needed)

/*
-- Only create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;
*/

-- 4. Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects'; 