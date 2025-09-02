# Webhook Debugging Guide

## 🔍 **Issue Analysis**

The debug tool works, which means the database updates are functioning correctly. The problem is that the Stripe webhook isn't being triggered during real purchases.

## 🎯 **Root Cause**

When using Stripe Connect with `transfer_data`, the webhook events are different from regular Stripe payments. The main events you need to listen for are:

1. **`checkout.session.completed`** - When the checkout session is completed
2. **`payment_intent.succeeded`** - When the payment intent succeeds (this is the key one for Connect transfers)

## 📋 **Debugging Steps**

### **Step 1: Check Webhook Configuration**

1. **Go to Stripe Dashboard** → **Developers** → **Webhooks**
2. **Verify your endpoint URL**: `https://your-domain.com/api/webhooks/stripe`
3. **Check enabled events**: Should include:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `account.updated` (for Connect accounts)

### **Step 2: Test Webhook Endpoint**

Visit: `https://your-domain.com/api/webhooks/stripe`

You should see a JSON response confirming the endpoint is accessible.

### **Step 3: Check Server Logs**

Look for these log messages in your server console:

```
🔔 Webhook received: { hasBody: true, bodyLength: 1234, hasSignature: true, ... }
✅ Webhook validated: { eventType: 'payment_intent.succeeded', eventId: 'evt_...', ... }
```

### **Step 4: Common Issues**

#### **Issue 1: Wrong Webhook URL**
- **Problem**: Webhook URL doesn't match your domain
- **Solution**: Update webhook URL in Stripe Dashboard

#### **Issue 2: Missing Events**
- **Problem**: Only listening to `checkout.session.completed`
- **Solution**: Add `payment_intent.succeeded` event

#### **Issue 3: Webhook Secret Mismatch**
- **Problem**: `STRIPE_WEBHOOK_SECRET` doesn't match
- **Solution**: Copy the webhook secret from Stripe Dashboard

#### **Issue 4: Server Not Receiving Webhooks**
- **Problem**: Firewall/network blocking webhooks
- **Solution**: Check server logs and network configuration

## 🛠️ **Quick Fix**

The most likely issue is that you're only listening to `checkout.session.completed` but need to also listen to `payment_intent.succeeded` for Connect transfers.

### **In Stripe Dashboard:**
1. Go to **Developers** → **Webhooks**
2. Edit your webhook endpoint
3. Add these events:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `account.updated`

## 🧪 **Test Process**

1. **Use the debug tool** at `/debug-webhook` to verify database updates work
2. **Check webhook configuration** in Stripe Dashboard
3. **Make a test purchase** and watch server logs
4. **Look for webhook events** in the logs

## 📊 **Expected Log Flow**

When a purchase is made, you should see:

```
🔔 Webhook received: { hasBody: true, bodyLength: 1234, ... }
✅ Webhook validated: { eventType: 'payment_intent.succeeded', ... }
💰 Payment Intent succeeded: { id: 'pi_...', amount: 1000, ... }
🔄 Processing payment intent success for Connect transfer: { ... }
✅ Order updated via payment intent: [order data]
✅ Listing marked as sold via payment intent: [listing data]
```

## 🚨 **If Still Not Working**

1. **Check Stripe Dashboard** → **Logs** for webhook delivery attempts
2. **Verify webhook secret** in your environment variables
3. **Test with Stripe CLI** if available
4. **Check server firewall** and network configuration

The issue is almost certainly in the webhook configuration, not the code! 