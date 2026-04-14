-- Adds listing fee support, listing lifecycle status, and admin role controls.

DO $$ BEGIN
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE listing_status AS ENUM ('draft', 'active', 'sold', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE listing_fee_status AS ENUM ('pending', 'paid', 'failed', 'cancelled', 'refunded', 'free');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE public.listings
    ADD COLUMN IF NOT EXISTS status listing_status NOT NULL DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS listing_fee_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS listing_fee_status listing_fee_status NOT NULL DEFAULT 'free',
    ADD COLUMN IF NOT EXISTS listing_fee_paid_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

CREATE TABLE IF NOT EXISTS public.listing_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    listed_price DECIMAL(10,2) NOT NULL CHECK (listed_price >= 0),
    fee_amount DECIMAL(10,2) NOT NULL CHECK (fee_amount >= 0),
    stripe_checkout_session_id TEXT UNIQUE,
    stripe_payment_intent_id TEXT,
    status listing_fee_status NOT NULL DEFAULT 'pending',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.listings
    ADD COLUMN IF NOT EXISTS listing_fee_payment_id UUID REFERENCES public.listing_fees(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_listing_fee_status ON public.listings(listing_fee_status);
CREATE INDEX IF NOT EXISTS idx_listing_fees_seller_id ON public.listing_fees(seller_id);
CREATE INDEX IF NOT EXISTS idx_listing_fees_listing_id ON public.listing_fees(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_fees_status ON public.listing_fees(status);
CREATE INDEX IF NOT EXISTS idx_listing_fees_checkout_session_id ON public.listing_fees(stripe_checkout_session_id);

DROP TRIGGER IF EXISTS update_listing_fees_updated_at ON public.listing_fees;
CREATE TRIGGER update_listing_fees_updated_at
BEFORE UPDATE ON public.listing_fees
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.listing_fees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sellers can view their own listing fees" ON public.listing_fees;
CREATE POLICY "Sellers can view their own listing fees" ON public.listing_fees
    FOR SELECT USING ((select auth.uid()) = seller_id);

DROP POLICY IF EXISTS "Sellers can insert listing fees for themselves" ON public.listing_fees;
CREATE POLICY "Sellers can insert listing fees for themselves" ON public.listing_fees
    FOR INSERT WITH CHECK ((select auth.uid()) = seller_id);

DROP POLICY IF EXISTS "Admins can view all listing fees" ON public.listing_fees;
CREATE POLICY "Admins can view all listing fees" ON public.listing_fees
    FOR SELECT USING (
      EXISTS (
        SELECT 1
        FROM public.users u
        WHERE u.id = (select auth.uid()) AND u.role::text = 'admin'
      )
    );
