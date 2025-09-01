# Webhook Debugging and Testing Guide

## Issue: Purchase Successful but Listing Not Marked as Sold

The purchase is completing successfully, but the listing isn't being marked as sold and doesn't appear in the Purchased tab. This suggests the webhook isn't being triggered or there's an issue with the webhook processing.

## Debugging Steps

### 1. Check Webhook Endpoint
The webhook endpoint should be: `https://your-domain.com/api/webhooks/stripe`

### 2. Verify Stripe Webhook Configuration
In your Stripe Dashboard:
1. Go to Developers → Webhooks
2. Check if the webhook endpoint is configured
3. Verify the webhook secret matches your `STRIPE_WEBHOOK_SECRET` environment variable
4. Ensure `checkout.session.completed` events are being sent

### 3. Test Webhook Locally
If testing locally, use Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 4. Check Console Logs
Look for these log messages in your application console:
- `🔔 Webhook received:`
- `✅ Webhook validated:`
- `🔄 Processing checkout completion:`
- `✅ Order updated:`
- `✅ Listing marked as sold:`

### 5. Database Verification
Check your Supabase database:
1. **Orders table**: Look for the order record with `status = 'paid'`
2. **Listings table**: Check if `is_sold = true` for the purchased listing
3. **Notifications table**: Verify notifications were created

## Common Issues and Solutions

### Issue 1: Webhook Not Triggered
**Symptoms**: No webhook logs in console
**Solution**: 
- Verify webhook endpoint URL in Stripe Dashboard
- Check webhook secret configuration
- Ensure `checkout.session.completed` events are enabled

### Issue 2: Webhook Fails Validation
**Symptoms**: `❌ No signature provided` or `❌ Invalid webhook signature`
**Solution**:
- Check `STRIPE_WEBHOOK_SECRET` environment variable
- Verify webhook secret in Stripe Dashboard matches

### Issue 3: Database Update Fails
**Symptoms**: `❌ Order update error` or `❌ Listing update error`
**Solution**:
- Check RLS policies for orders and listings tables
- Verify database permissions
- Check for foreign key constraints

### Issue 4: RLS Policy Issues
**Symptoms**: Database operations fail with permission errors
**Solution**:
- Run the RLS policies script: `scripts/add-orders-rls-policies.sql`
- Ensure admin Supabase client is used in webhook

## Testing the Fix

### Step 1: Make a Test Purchase
1. Create a test listing
2. Complete a purchase with Stripe test card
3. Monitor console logs for webhook activity

### Step 2: Verify Database Updates
Check these tables in Supabase:
```sql
-- Check orders table
SELECT * FROM orders WHERE listing_id = 'your-listing-id' ORDER BY created_at DESC;

-- Check listings table
SELECT id, title, is_sold, updated_at FROM listings WHERE id = 'your-listing-id';

-- Check notifications table
SELECT * FROM notifications WHERE related_id = 'your-listing-id';
```

### Step 3: Verify UI Updates
1. Refresh the listing page - should show "This item has been sold"
2. Check buyer's dashboard - should show item in "Purchased" tab
3. Check seller's dashboard - should show item in "Sold Items" tab
4. Check listings page - item should not appear (filtered out)

## Manual Fix (If Webhook Fails)

If the webhook isn't working, you can manually update the database:

```sql
-- Mark listing as sold
UPDATE listings SET is_sold = true WHERE id = 'your-listing-id';

-- Update order status
UPDATE orders SET status = 'paid' WHERE listing_id = 'your-listing-id';
```

## Next Steps

1. **Check webhook configuration** in Stripe Dashboard
2. **Monitor console logs** during purchase
3. **Verify database updates** in Supabase
4. **Test purchase flow** end-to-end
5. **Apply RLS policies** if not already done 