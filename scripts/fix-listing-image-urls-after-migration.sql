-- =============================================
-- FIX LISTING IMAGE URLS AFTER SUPABASE MIGRATION
-- =============================================
-- Your app stores full Supabase storage URLs in listings.image_urls.
-- After restoring to a new project, those URLs still point at the OLD
-- project. This script rewrites them to use your NEW project URL.
--
-- Run this in Supabase Dashboard → SQL Editor.
-- The URL below matches your .env.local (NEXT_PUBLIC_SUPABASE_URL).

UPDATE listings
SET image_urls = (
  SELECT COALESCE(
    array_agg(
      regexp_replace(
        elem,
        '^https://[^/]+\.supabase\.co',
        'https://ecwwcfbkqeqwjvbhglxn.supabase.co'
      )
    ),
    array[]::text[]
  )
  FROM unnest(COALESCE(image_urls, array[]::text[])) AS elem
)
WHERE image_urls IS NOT NULL AND array_length(image_urls, 1) > 0;
