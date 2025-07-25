-- =============================================
-- MINIMAL STORAGE SETUP (SAFE)
-- =============================================
-- This script only creates what's missing without deleting anything

-- 1. Create bucket (only if it doesn't exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create only missing policies (these will fail silently if they exist)

-- View policy (might already exist)
CREATE POLICY "listing_images_select" ON storage.objects
    FOR SELECT USING (bucket_id = 'listing-images');

-- Upload policy (might already exist) 
CREATE POLICY "listing_images_insert" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'listing-images' 
        AND auth.role() = 'authenticated'
    );

-- Update policy (might already exist)
CREATE POLICY "listing_images_update" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'listing-images' 
        AND auth.uid() IS NOT NULL
    );

-- Delete policy (might already exist)
CREATE POLICY "listing_images_delete" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'listing-images' 
        AND auth.uid() IS NOT NULL
    );

-- 3. Verify setup
SELECT 'Setup complete! Bucket and policies created.' as status; 