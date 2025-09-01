# Quick Webhook Test Script

## To test if the webhook is working:

1. **Check your Stripe Dashboard:**
   - Go to Developers → Webhooks
   - Verify you have a webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Make sure `checkout.session.completed` events are enabled

2. **Check your environment variables:**
   - Verify `STRIPE_WEBHOOK_SECRET` is set correctly
   - The secret should match what's in your Stripe Dashboard

3. **Make a test purchase and watch the console:**
   - Look for these log messages:
     - `🔔 Webhook received:`
     - `✅ Webhook validated:`
     - `🔄 Processing checkout completion:`
     - `✅ Order updated:`
     - `✅ Listing marked as sold:`

4. **If you don't see webhook logs:**
   - The webhook isn't being triggered
   - Check your Stripe webhook configuration
   - Verify the webhook endpoint URL is correct

5. **If you see webhook logs but no database updates:**
   - Check for error messages like `❌ Order update error:` or `❌ Listing update error:`
   - The RLS policies might need to be applied

## To apply RLS policies (if needed):

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable RLS on orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own orders
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (
        (select auth.uid()) = buyer_id OR
        (select auth.uid()) = seller_id
    );

-- Policy for system to insert orders (for webhooks)
CREATE POLICY "System can insert orders" ON public.orders
    FOR INSERT WITH CHECK (true);

-- Policy for system to update orders (for webhooks)
CREATE POLICY "System can update orders" ON public.orders
    FOR UPDATE USING (true);

-- Policy for users to update their own orders
CREATE POLICY "Users can update their own orders" ON public.orders
    FOR UPDATE USING (
        (select auth.uid()) = buyer_id OR
        (select auth.uid()) = seller_id
    );
```

## Manual database check:

After making a purchase, check your Supabase database:

```sql
-- Check if order was created
SELECT * FROM orders WHERE listing_id = 'your-listing-id' ORDER BY created_at DESC;

-- Check if listing was marked as sold
SELECT id, title, is_sold, updated_at FROM listings WHERE id = 'your-listing-id';

-- Check if notifications were created
SELECT * FROM notifications WHERE related_id = 'your-listing-id';
```

## Expected behavior:

1. **Purchase completes** → Order record created with `status = 'pending'`
2. **Webhook fires** → Order updated to `status = 'paid'`
3. **Webhook continues** → Listing marked as `is_sold = true`
4. **Webhook finishes** → Notifications created for buyer and seller
5. **UI updates** → Listing disappears from listings page, appears in dashboard tabs
