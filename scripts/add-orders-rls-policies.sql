-- Add RLS policies for orders table
-- This script adds the necessary RLS policies for the orders table

-- Enable RLS on orders table (if not already enabled)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own orders (as buyer or seller)
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (
        (select auth.uid()) = buyer_id OR  -- As buyer
        (select auth.uid()) = seller_id   -- As seller
    );

-- Policy for system to insert orders (for webhooks)
CREATE POLICY "System can insert orders" ON public.orders
    FOR INSERT WITH CHECK (true);

-- Policy for system to update orders (for webhooks)
CREATE POLICY "System can update orders" ON public.orders
    FOR UPDATE USING (true);

-- Policy for users to update their own orders (limited use cases)
CREATE POLICY "Users can update their own orders" ON public.orders
    FOR UPDATE USING (
        (select auth.uid()) = buyer_id OR  -- As buyer
        (select auth.uid()) = seller_id     -- As seller
    );

-- Add index for better performance on orders queries
CREATE INDEX IF NOT EXISTS idx_orders_buyer_seller_status ON public.orders(buyer_id, seller_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);

-- Add trigger to update updated_at column
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
