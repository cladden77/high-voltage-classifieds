# Payment Error Fix - Removed Payments Table Dependency

## Issue
The application was trying to insert records into a `payments` table that doesn't exist in the database schema, causing purchase errors.

## Root Cause
The code was attempting to use a `payments` table for tracking payment records, but the main database schema (`supabase-schema.sql`) only includes an `orders` table for payment tracking.

## Solution
Updated all payment-related code to use the `orders` table instead of the non-existent `payments` table.

## Files Modified

### 1. `src/lib/stripe.ts`
- **Before**: Inserting into `payments` table with `amount` field
- **After**: Inserting into `orders` table with `amount_paid` field
- **Change**: Updated field name to match orders table schema

### 2. `src/app/api/webhooks/stripe/route.ts`
- **Before**: Updating `payments` table and creating duplicate `orders` records
- **After**: Only updating existing `orders` records
- **Change**: Removed duplicate order creation, now updates existing pending orders

### 3. `src/app/api/payments/stripe/route.ts`
- **Before**: Inserting into `payments` table
- **After**: Inserting into `orders` table
- **Change**: Updated to use correct table and field names

### 4. `src/lib/database.types.ts`
- **Before**: Included `payments` table types
- **After**: Removed `payments` table types
- **Change**: Cleaned up unused table definitions

## Database Schema
The application now correctly uses the `orders` table structure:

```sql
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL,
    payment_intent_id TEXT,
    paypal_order_id TEXT,
    status order_status NOT NULL DEFAULT 'pending',
    shipping_address JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Purchase Flow Now Works As Follows:

1. **Checkout Initiated**: Order record created with `status: 'pending'`
2. **Payment Completed**: Webhook updates order to `status: 'paid'` and marks listing as sold
3. **Notifications Sent**: Both buyer and seller receive notifications
4. **Dashboard Updated**: Purchase appears in buyer's "Purchased" tab and seller's "Sold Items" tab

## Testing
The purchase functionality should now work without database errors. The system will:
- ✅ Create order records during checkout
- ✅ Update order status when payment completes
- ✅ Mark listings as sold
- ✅ Send notifications to buyers and sellers
- ✅ Display purchases in dashboard tabs

## Next Steps
1. Test a complete purchase flow
2. Verify notifications are sent correctly
3. Check that dashboard tabs show purchased/sold items
4. Monitor webhook processing for any remaining issues
