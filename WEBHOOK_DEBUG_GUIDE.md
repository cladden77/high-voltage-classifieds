# 🔍 Webhook Debugging Guide

## 🚨 Current Issue: Webhook Not Firing

The purchase completes but:
- ❌ Listing not marked as sold
- ❌ Seller not notified
- ❌ Payment status not updated

This means the webhook isn't firing or processing correctly.

## 🔧 Step-by-Step Debugging

### **1. Check Webhook Setup**

**Terminal 1: Start your app**
```bash
npm run dev
```

**Terminal 2: Set up Stripe webhook forwarding**
```bash
# Install Stripe CLI if not installed
# https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to your local app
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Expected Output from Terminal 2:**
```
> Ready! Your webhook signing secret is whsec_1234...
```

### **2. Update Environment Variables**

Add the webhook secret to `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_1234... # Copy from Terminal 2 output
```

### **3. Test Webhook Endpoint**

Test if your webhook endpoint is reachable:
```bash
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

**Expected**: Should return an error about missing signature (which is good!)

### **4. Check Database Tables**

Make sure these tables exist in Supabase:

**Run in Supabase SQL Editor:**
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('payments', 'listings', 'notifications');

-- Check if stripe_account_id column exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'stripe_account_id';
```

### **5. Test Complete Flow with Debugging**

**Step 1: Create Test Listing**
1. Login as seller
2. Create a listing with price $100
3. Note the listing ID

**Step 2: Purchase as Buyer**
1. Login as different user (buyer)
2. Go to listing page
3. Click "Buy Now with Stripe"
4. Use test card: `4242424242424242`
5. Complete purchase

**Step 3: Monitor Logs**

**Watch Terminal 1 (App Console):**
- Should show checkout session creation
- Should show payment record creation

**Watch Terminal 2 (Stripe CLI):**
- Should show webhook events being sent
- Should show successful delivery

**Expected Terminal 2 Output:**
```
-> checkout.session.completed [evt_test_...]
<- 200 POST http://localhost:3000/api/webhooks/stripe
```

### **6. Check Database After Purchase**

**In Supabase Dashboard:**
1. Go to Table Editor
2. Check `payments` table - should have new record
3. Check `listings` table - `is_sold` should be true
4. Check `notifications` table - should have seller notification

### **7. Manual Webhook Testing**

If webhook still doesn't work, test manually:

**Create a test webhook event:**
```bash
stripe trigger checkout.session.completed
```

**Expected**: Should trigger your webhook and update the database

## 🚨 Common Issues & Solutions

### **Issue 1: Webhook Secret Not Set**
**Symptoms**: Webhook validation fails
**Solution**: Copy webhook secret from `stripe listen` output

### **Issue 2: Database Tables Missing**
**Symptoms**: Webhook processes but no database updates
**Solution**: Run the SQL scripts to create tables

### **Issue 3: RLS Policies Blocking**
**Symptoms**: Database errors in webhook
**Solution**: Check RLS policies allow service role operations

### **Issue 4: Stripe Account Not Connected**
**Symptoms**: Checkout fails or webhook can't find seller
**Solution**: Ensure seller completed Stripe onboarding

## 🔍 Debugging Commands

### **Check Webhook Status:**
```bash
# List webhook endpoints
stripe webhook endpoints list

# View webhook logs
stripe webhook endpoints logs we_...
```

### **Test Webhook Locally:**
```bash
# Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# In another terminal, trigger test event
stripe trigger checkout.session.completed
```

### **Check Environment:**
```bash
# Verify environment variables
echo $STRIPE_WEBHOOK_SECRET
echo $STRIPE_SECRET_KEY
```

## 📊 Expected Database State After Purchase

### **payments table:**
```sql
SELECT * FROM payments WHERE payment_intent_id = 'pi_test_...';
-- Should show: status = 'completed'
```

### **listings table:**
```sql
SELECT * FROM listings WHERE id = 'your-listing-id';
-- Should show: is_sold = true
```

### **notifications table:**
```sql
SELECT * FROM notifications WHERE type = 'sale_completed';
-- Should show: seller notification
```

## 🎯 Success Indicators

✅ **Terminal 2 shows**: `-> checkout.session.completed`
✅ **App console shows**: `✅ Checkout completed:`
✅ **Database shows**: Listing marked as sold
✅ **Seller sees**: Notification bell with red badge

If any of these fail, follow the debugging steps above. 