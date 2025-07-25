-- =============================================
-- SUPABASE STORAGE SETUP FOR LISTING IMAGES
-- =============================================
-- Run this in your Supabase SQL Editor if you're having image upload issues

-- 1. Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Remove any existing policies to start fresh (run these one by one if needed)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Anyone can view listing images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload listing images" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update their own listing images" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete their own listing images" ON storage.objects;
EXCEPTION 
    WHEN OTHERS THEN 
        RAISE NOTICE 'Some policies may not exist, continuing...';
END $$;

-- 3. Create storage policies (with error handling)
DO $$ 
BEGIN
    -- Policy for viewing images
    BEGIN
        CREATE POLICY "Anyone can view listing images" ON storage.objects
            FOR SELECT USING (bucket_id = 'listing-images');
    EXCEPTION 
        WHEN duplicate_object THEN 
            RAISE NOTICE 'View policy already exists, skipping...';
    END;

    -- Policy for uploading images
    BEGIN
        CREATE POLICY "Authenticated users can upload listing images" ON storage.objects
            FOR INSERT WITH CHECK (
                bucket_id = 'listing-images' 
                AND auth.role() = 'authenticated'
            );
    EXCEPTION 
        WHEN duplicate_object THEN 
            RAISE NOTICE 'Upload policy already exists, skipping...';
    END;

    -- Policy for updating images
    BEGIN
        CREATE POLICY "Users can update their own listing images" ON storage.objects
            FOR UPDATE USING (
                bucket_id = 'listing-images' 
                AND auth.uid() IS NOT NULL
            );
    EXCEPTION 
        WHEN duplicate_object THEN 
            RAISE NOTICE 'Update policy already exists, skipping...';
    END;

    -- Policy for deleting images
    BEGIN
        CREATE POLICY "Users can delete their own listing images" ON storage.objects
            FOR DELETE USING (
                bucket_id = 'listing-images' 
                AND auth.uid() IS NOT NULL
            );
    EXCEPTION 
        WHEN duplicate_object THEN 
            RAISE NOTICE 'Delete policy already exists, skipping...';
    END;
END $$;

-- 4. Verify the setup
SELECT 
    b.id as bucket_id,
    b.name as bucket_name,
    b.public as is_public,
    b.created_at
FROM storage.buckets b 
WHERE b.id = 'listing-images';

-- If you see the bucket listed above, storage is properly configured! 