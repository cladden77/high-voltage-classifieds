# Stripe Connect Setup Guide

This guide walks you through setting up Stripe Connect with Express accounts for your High Voltage Classifieds platform.

## 🔧 Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...                    # Your Stripe secret key (test mode)
STRIPE_PUBLISHABLE_KEY=pk_test_...              # Your Stripe publishable key (test mode)
STRIPE_WEBHOOK_SECRET=whsec_...                 # Webhook endpoint secret

# Application URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000      # Your app's base URL
```

### Production Environment Variables

For production, replace test keys with live keys:

```bash
# Production Stripe Configuration
STRIPE_SECRET_KEY=sk_live_...                   # Your Stripe live secret key
STRIPE_PUBLISHABLE_KEY=pk_live_...             # Your Stripe live publishable key
STRIPE_WEBHOOK_SECRET=whsec_...                # Production webhook secret
NEXT_PUBLIC_BASE_URL=https://yourdomain.com    # Your production domain
```

## 🚀 Stripe Account Setup

### 1. Create Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create an account or sign in
3. Navigate to **API Keys** in the dashboard
4. Copy your **Publishable key** and **Secret key**

### 2. Enable Connect
1. In your Stripe dashboard, go to **Connect** → **Settings**
2. Enable Connect for your account
3. Configure your platform settings:
   - **Platform name**: High Voltage Classifieds
   - **Platform URL**: Your domain
   - **Support email**: Your support email

### 3. Configure Webhooks
1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select these events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `account.updated` (optional, for Connect account updates)
5. Copy the webhook signing secret

## 🧪 Test Mode Setup

### Testing Seller Onboarding

1. **Create a seller account** in your app
2. **Connect Stripe account** using the ConnectAccountButton component
3. **Use test data** in Stripe onboarding:
   - Business type: Individual
   - Country: United States
   - Use test bank account: `000123456789` (routing: `110000000`)
   - Use test SSN: `000-00-0000`
   - Use test address and phone number

### Testing Buyer Purchases

Use these test card numbers:

```bash
# Successful payments
4242424242424242    # Visa (basic)
4000000000000077    # Visa (charge declined)
4000000000009995    # Visa (insufficient funds)

# 3D Secure cards (requires authentication)
4000000000003220    # 3D Secure 2 authentication required

# Additional test cards
5555555555554444    # Mastercard
378282246310005     # American Express
```

**Test card details:**
- Use any future expiration date
- Use any 3-digit CVC (4 digits for Amex)
- Use any ZIP code

### Testing Webhooks Locally

#### Option 1: Stripe CLI (Recommended)
1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Login: `stripe login`
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copy the webhook signing secret from the CLI output
5. Add it to your `.env.local` as `STRIPE_WEBHOOK_SECRET`

#### Option 2: ngrok + Dashboard Webhooks
1. Install [ngrok](https://ngrok.com/)
2. Expose your local server: `ngrok http 3000`
3. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
4. In Stripe dashboard, create webhook endpoint: `https://abc123.ngrok.io/api/webhooks/stripe`
5. Configure the events listed above

## 📊 Database Schema Update

Run this SQL in your Supabase SQL editor to add the Stripe account field:

```sql
-- Add stripe_account_id column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_stripe_account_id 
ON public.users(stripe_account_id);
```

## 🔄 Implementation Flow

### 1. Seller Onboarding Flow
```
1. Seller clicks "Connect Stripe Account" button
2. API creates Stripe Express account
3. Seller redirected to Stripe onboarding
4. On completion, redirected back to dashboard
5. stripe_account_id saved in database
6. Seller can now receive payments
```

### 2. Buyer Purchase Flow
```
1. Buyer clicks "Buy Now" button
2. API creates Stripe Checkout session with transfer_data
3. Buyer redirected to Stripe Checkout
4. Payment processed directly to seller
5. Webhook updates listing as sold
6. Buyer redirected to success page
```

## 🎯 Usage Examples

### Basic Connect Button
```tsx
import ConnectAccountButton from '@/components/stripe/ConnectAccountButton'

function SellerDashboard() {
  return (
    <ConnectAccountButton 
      onSuccess={(data) => console.log('Connected!', data)}
      onError={(error) => console.error('Failed:', error)}
    />
  )
}
```

### Basic Checkout Button
```tsx
import CheckoutButton from '@/components/stripe/CheckoutButton'

function ListingPage({ listing }) {
  return (
    <CheckoutButton
      listingId={listing.id}
      listingTitle={listing.title}
      price={listing.price}
      onSuccess={(data) => console.log('Checkout started!', data)}
    />
  )
}
```

### Account Status Component
```tsx
import StripeAccountStatus from '@/components/stripe/StripeAccountStatus'

function SellerProfile() {
  return (
    <StripeAccountStatus 
      showDetails={true}
      className="mb-6"
    />
  )
}
```

## 🔐 Security Notes

### 1. Route Protection
- Only authenticated sellers can create Stripe accounts
- Only authenticated buyers can initiate checkouts
- Sellers cannot buy their own listings

### 2. Data Validation
- All API endpoints validate user authentication
- Listing availability is checked before checkout
- Webhook signatures are verified

### 3. Error Handling
- Graceful fallbacks for failed API calls
- User-friendly error messages
- Comprehensive logging for debugging

## 💰 Platform Fees (Future Implementation)

The codebase is structured to easily add platform fees later. To enable fees:

1. **Update checkout session creation** in `src/lib/stripe.ts`:
```typescript
// Uncomment this line in createCheckoutSession:
application_fee_amount: Math.round(listing.price * 100 * 0.029), // 2.9% platform fee
```

2. **Add fee calculation logic**:
```typescript
// Use the helper function:
const platformFee = calculatePlatformFee(listing.price, 2.9) // 2.9%
```

3. **Update UI** to show fee breakdown to buyers

## 🐛 Troubleshooting

### Common Issues

**"Seller has not set up their Stripe account"**
- Seller needs to complete Stripe onboarding
- Check if `stripe_account_id` exists in database
- Verify account is fully onboarded via Stripe dashboard

**"Webhook signature verification failed"**
- Check `STRIPE_WEBHOOK_SECRET` environment variable
- Ensure webhook endpoint is correctly configured
- Verify Stripe CLI is forwarding to correct URL

**"Authentication required"**
- User session may have expired
- Check Supabase auth configuration
- Verify cookies are being sent correctly

### Testing Checklist

- [ ] Seller can connect Stripe account
- [ ] Onboarding redirects work correctly
- [ ] Buyer can complete purchase
- [ ] Webhook updates listing status
- [ ] Payment appears in seller's Stripe dashboard
- [ ] Error handling works for edge cases

## 📚 Additional Resources

- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Express Accounts Guide](https://stripe.com/docs/connect/express-accounts)
- [Testing Connect](https://stripe.com/docs/connect/testing)
- [Webhooks Best Practices](https://stripe.com/docs/webhooks/best-practices)

## 🚨 Important Notes

1. **Test Mode**: Always test thoroughly in test mode before going live
2. **Compliance**: Ensure your platform complies with applicable regulations
3. **Support**: Set up proper customer support for payment issues
4. **Monitoring**: Monitor webhook delivery and payment success rates
5. **Backups**: Keep backups of transaction data and configurations