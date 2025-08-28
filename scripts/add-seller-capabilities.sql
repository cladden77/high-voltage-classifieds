-- =============================================
-- ADD SELLER CAPABILITIES TO USERS TABLE
-- =============================================
-- Run this script in your Supabase SQL Editor to add seller capabilities support
-- This script is idempotent and can be run multiple times safely

-- Add seller capabilities fields to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS can_sell BOOLEAN DEFAULT FALSE;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS seller_verified BOOLEAN DEFAULT FALSE;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS seller_verification_date TIMESTAMP WITH TIME ZONE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_can_sell 
ON public.users(can_sell);

CREATE INDEX IF NOT EXISTS idx_users_seller_verified 
ON public.users(seller_verified);

-- Add comments to document the fields
COMMENT ON COLUMN public.users.can_sell IS 'Whether user has opted in to seller capabilities';
COMMENT ON COLUMN public.users.seller_verified IS 'Whether user has completed Stripe Connect onboarding';
COMMENT ON COLUMN public.users.seller_verification_date IS 'Date when seller verification was completed';

-- Update existing users with role='seller' to have seller capabilities
UPDATE public.users 
SET can_sell = TRUE, seller_verified = TRUE, seller_verification_date = NOW()
WHERE role = 'seller' AND can_sell IS NULL;

-- Update existing users with role='buyer' to not have seller capabilities
UPDATE public.users 
SET can_sell = FALSE, seller_verified = FALSE
WHERE role = 'buyer' AND can_sell IS NULL;
