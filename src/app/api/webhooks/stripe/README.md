# Stripe Webhooks API Route

This endpoint handles Stripe webhook events for the High Voltage Classifieds platform.

## Endpoint

`POST /api/webhooks/stripe`

## Supported Events

### Stripe Connect Events

- **`checkout.session.completed`**: When a buyer completes payment
  - Updates payment status to "completed"
  - Marks listing as sold
  - Logs transaction details

- **`checkout.session.expired`**: When checkout session expires
  - Updates payment status to "cancelled"

### Legacy Payment Intent Events (for backwards compatibility)

- **`payment_intent.succeeded`**: Payment successful
- **`payment_intent.payment_failed`**: Payment failed
- **`payment_intent.canceled`**: Payment cancelled

### Connect Account Events (informational)

- **`account.updated`**: When a Connect account is updated
  - Logged for monitoring purposes

## Webhook Security

The endpoint verifies webhook signatures using the `STRIPE_WEBHOOK_SECRET` environment variable to ensure requests are from Stripe.

## Testing Webhooks

### Using Stripe CLI (Recommended)

```bash
# Install Stripe CLI
# Login to your account
stripe login

# Forward webhooks to your local development server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook signing secret and add to .env.local
```

### Using ngrok + Dashboard

```bash
# Install and run ngrok
ngrok http 3000

# Configure webhook endpoint in Stripe dashboard:
# https://your-ngrok-url.ngrok.io/api/webhooks/stripe
```

## Required Environment Variables

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Error Handling

- Invalid signatures return 400 status
- Database errors are logged but don't prevent webhook acknowledgment
- All events return 200 status with `{ received: true }` for proper Stripe acknowledgment

## Monitoring

The webhook logs detailed information for:
- Successful payments
- Failed payments
- Account updates
- Unhandled event types

Check your application logs for webhook processing status.