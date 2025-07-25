-- =============================================
-- FIX STORAGE RLS POLICIES
-- =============================================
-- This fixes the "new row violates row-level security policy" error

-- 1. First, let's remove the problematic policies
DROP POLICY IF EXISTS "Anyone can view listing images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own listing images" ON storage.objects;
DROP POLICY IF EXISTS "listing_images_select" ON storage.objects;
DROP POLICY IF EXISTS "listing_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "listing_images_update" ON storage.objects;
DROP POLICY IF EXISTS "listing_images_delete" ON storage.objects;

-- 2. Create more permissive policies that actually work
CREATE POLICY "Public read access for listing images" ON storage.objects
    FOR SELECT USING (bucket_id = 'listing-images');

CREATE POLICY "Authenticated users can upload to listing images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'listing-images' 
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "Authenticated users can update listing images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'listing-images' 
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "Authenticated users can delete listing images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'listing-images' 
        AND auth.uid() IS NOT NULL
    );

-- 3. Ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 4. Verify the policies are created
SELECT 
    policyname,
    cmd as policy_type,
    with_check,
    qual
FROM pg_policies 
WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname LIKE '%listing%';

SELECT 'Storage RLS policies fixed!' as status; 