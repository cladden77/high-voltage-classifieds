-- Simple Stripe Connect migration for Supabase
-- Run this in Supabase SQL Editor

-- Add stripe_account_id column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_stripe_account_id 
ON public.users(stripe_account_id);