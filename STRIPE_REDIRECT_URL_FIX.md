# Stripe Redirect URL Fix

## 🚨 Issue Description

When testing Stripe Connect account creation on your Vercel deployment, you're receiving this error:

```json
{
  "error": {
    "message": "Redirect urls must begin with HTTP or HTTPS.",
    "type": "invalid_request_error"
  }
}
```

## 🔍 Root Cause

The error occurs because the `NEXT_PUBLIC_BASE_URL` environment variable is either:
1. Not set in your Vercel deployment
2. Set to an invalid value that doesn't start with `http://` or `https://`

## ✅ Code Fixes Applied

### 1. Fixed Stripe Connect Implementation (`src/lib/stripe.ts`)

Added proper fallback and validation for the base URL:

```typescript
// Ensure we have a valid base URL for redirects
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

// Validate that the base URL starts with http or https
if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
  throw new Error('NEXT_PUBLIC_BASE_URL must start with http:// or https://')
}

const accountLink = await stripe.accountLinks.create({
  account: stripeAccountId,
  refresh_url: `${baseUrl}/dashboard?stripe_refresh=true`,
  return_url: `${baseUrl}/dashboard?stripe_onboarding=complete`,
  type: 'account_onboarding',
})
```

### 2. Fixed PayPal Integration (`src/lib/payments.ts`)

Replaced legacy `NEXTAUTH_URL` references with proper `NEXT_PUBLIC_BASE_URL`:

```typescript
application_context: {
  return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success`,
  cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/cancel`,
},
```

## 🚀 Vercel Deployment Fix

### Step 1: Set Environment Variable in Vercel

1. Go to your Vercel dashboard
2. Navigate to your project
3. Go to **Settings** → **Environment Variables**
4. Add a new environment variable:
   - **Name**: `NEXT_PUBLIC_BASE_URL`
   - **Value**: `https://your-vercel-domain.vercel.app` (replace with your actual Vercel domain)
   - **Environment**: Production (and Preview if needed)

### Step 2: Verify Your Domain

Make sure to use your actual Vercel deployment URL. For example:
- If your app is deployed at `https://high-voltage-classifieds.vercel.app`
- Set `NEXT_PUBLIC_BASE_URL=https://high-voltage-classifieds.vercel.app`

### Step 3: Redeploy

After setting the environment variable, redeploy your application:
1. Go to **Deployments** in your Vercel dashboard
2. Click **Redeploy** on your latest deployment
3. Or push a new commit to trigger a new deployment

## 🧪 Testing

After applying these fixes:

1. **Test Stripe Connect Setup**:
   - Go to your deployed app
   - Sign in as a seller
   - Navigate to dashboard
   - Click "Connect Stripe Account"
   - The onboarding should now work without the redirect URL error

2. **Verify Environment Variable**:
   - You can temporarily add a debug endpoint to verify the environment variable is set correctly
   - Or check the Vercel deployment logs for any related errors

## 📝 Additional Notes

- The fallback to `http://localhost:3000` ensures local development still works
- The validation ensures that only valid HTTP/HTTPS URLs are used for Stripe redirects
- This fix applies to both Stripe Connect and PayPal integrations

## 🔧 Troubleshooting

If you still encounter issues:

1. **Check Vercel Environment Variables**:
   - Ensure the variable is set for the correct environment (Production/Preview)
   - Verify the URL format is correct (must start with `https://`)

2. **Check Deployment Logs**:
   - Look for any errors related to environment variables
   - Verify the deployment is using the updated code

3. **Test Locally First**:
   - Set `NEXT_PUBLIC_BASE_URL=https://your-vercel-domain.vercel.app` in your local `.env.local`
   - Test the Stripe Connect flow locally to ensure it works

## 🎯 Expected Result

After applying these fixes and setting the environment variable in Vercel, the Stripe Connect onboarding should work seamlessly without the redirect URL error. 