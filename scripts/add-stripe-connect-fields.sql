-- =============================================
-- ADD STRIPE CONNECT FIELDS TO USERS TABLE
-- =============================================
-- Run this script in your Supabase SQL Editor to add Stripe Connect support

-- Add stripe_account_id column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;

-- Create index for better performance when querying by stripe_account_id
CREATE INDEX IF NOT EXISTS idx_users_stripe_account_id 
ON public.users(stripe_account_id);

-- Add comment to document the field
COMMENT ON COLUMN public.users.stripe_account_id IS 'Stripe Connect Express account ID for sellers to receive payments';