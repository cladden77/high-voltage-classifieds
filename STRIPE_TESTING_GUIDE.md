# Complete Stripe Connect Testing Guide

## 🚀 End-to-End Testing Setup

### Prerequisites Setup

1. **Terminal 1: Start your app**
```bash
npm run dev
```

2. **Terminal 2: Set up Stripe webhook forwarding**
```bash
# Install Stripe CLI if not already installed
# https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to your local app
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

3. **Copy the webhook secret** from Terminal 2 output and add to `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_1234... # From stripe listen output
```

### Complete Test Flow

## 📝 **Step-by-Step Testing Process**

### **Phase 1: Seller Setup**
1. **Create/Login as Seller Account**
   - Go to `/auth/signup` or `/auth/signin`
   - Make sure role is set to "seller"

2. **Connect Stripe Account**
   - Go to `/dashboard`
   - You should see "Payment Setup Required" alert
   - Click "Payment Setup" tab
   - Click "Connect Stripe Account"
   - Complete Stripe onboarding with test data:
     - Business type: Individual
     - Country: United States
     - Bank account: `000123456789` (routing: `110000000`)
     - SSN: `000-00-0000`
     - Use any test address

3. **Create a Test Listing**
   - Go to `/dashboard/create-listing`
   - Fill out listing details
   - Set a price (e.g., $100)
   - Submit listing

### **Phase 2: Buyer Purchase Test**
1. **Create/Login as Buyer Account**
   - Use different email than seller
   - Role: "buyer"

2. **Find and Purchase Listing**
   - Go to `/listings` or find your test listing
   - Click on the listing to view details
   - Click "Buy Now with Stripe" button

3. **Complete Stripe Checkout**
   - Use test card: `4242424242424242`
   - Use any future expiration date
   - Use any 3-digit CVC
   - Use any ZIP code
   - Complete the purchase

### **Phase 3: Verify Automatic Updates**

#### **What Should Happen Automatically:**

1. **Webhook Triggers** (Check Terminal 2):
```
✅ checkout.session.completed event received
✅ Payment status updated to 'completed'
✅ Listing marked as sold
```

2. **Database Updates** (Verify in Supabase dashboard):
   - `payments` table: Status = 'completed'
   - `listings` table: `is_sold` = true

3. **UI Updates**:
   - Listing page shows "This item has been sold"
   - Buy button becomes disabled/hidden
   - Seller dashboard shows listing as "Sold"

## 🔍 **How to Monitor the Test**

### **Watch Your Terminals:**

**Terminal 1 (App Console):**
```
✅ Checkout completed: {
  sessionId: 'cs_test_...',
  paymentIntentId: 'pi_test_...',
  listingId: 'listing-uuid',
  amount: 10000
}
```

**Terminal 2 (Stripe CLI):**
```
-> checkout.session.completed [evt_test_...]
<- 200 POST http://localhost:3000/api/webhooks/stripe
```

### **Verify in Supabase Dashboard:**

1. **Go to Supabase Dashboard → Table Editor**

2. **Check `payments` table:**
   - Find the payment record
   - Verify `status` = 'completed'
   - Check `payment_intent_id` matches

3. **Check `listings` table:**
   - Find your test listing
   - Verify `is_sold` = true
   - Check `updated_at` timestamp

### **Verify in UI:**

1. **Refresh the listing page** - Should show "sold"
2. **Check seller dashboard** - Listing should show "Sold" status
3. **Try to purchase again** - Button should be disabled

## 🚨 **Troubleshooting Common Issues**

### **Webhook Not Firing:**
- Check Terminal 2 for webhook events
- Verify `STRIPE_WEBHOOK_SECRET` in `.env.local`
- Restart `stripe listen` command

### **Database Not Updating:**
- Check app console for errors
- Verify Supabase connection
- Check RLS policies allow updates

### **UI Not Reflecting Changes:**
- Hard refresh the page (Cmd+Shift+R / Ctrl+Shift+R)
- Check browser console for errors
- Verify listing ID matches

## 📊 **Test Scenarios to Cover**

### **Happy Path:**
- ✅ Successful purchase and automatic updates
- ✅ Seller can see sold listing in dashboard
- ✅ Buyer cannot purchase sold items

### **Error Scenarios:**
- ❌ Invalid card (use `4000000000000002`)
- ❌ Insufficient funds (use `4000000000009995`)
- ❌ Expired session (wait 24 hours)

### **Edge Cases:**
- 🔄 Multiple buyers trying to purchase same item
- 🔄 Seller trying to buy their own item
- 🔄 Webhook retries if endpoint is down

## 🎯 **Success Criteria**

Your test is successful when:
1. ✅ Stripe checkout completes successfully
2. ✅ Webhook fires and processes correctly
3. ✅ Payment record created with 'completed' status
4. ✅ Listing automatically marked as sold
5. ✅ UI updates reflect the sale
6. ✅ Seller can see the sale in their dashboard
7. ✅ Money appears in seller's Stripe dashboard