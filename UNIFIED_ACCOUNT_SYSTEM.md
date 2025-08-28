# Unified Account System Implementation

## Overview
This document outlines the changes made to implement a unified account system where users can have both buyer and seller capabilities under a single account, eliminating the need for separate buyer/seller accounts.

## Key Changes Made

### 1. Database Schema Updates
- **File**: `scripts/add-seller-capabilities.sql`
- **Changes**: Added new fields to the `users` table:
  - `can_sell`: Boolean flag indicating if user has opted in to seller capabilities
  - `seller_verified`: Boolean flag indicating if user has completed Stripe Connect onboarding
  - `seller_verification_date`: Timestamp when seller verification was completed
- **Indexes**: Added performance indexes for the new fields
- **Migration**: Automatically updates existing users (sellers get capabilities enabled, buyers get disabled)

### 2. Database Types Updates
- **File**: `src/lib/database.types.ts`
- **Changes**: Added the new seller capability fields to TypeScript types for all CRUD operations

### 3. Authentication System Updates
- **File**: `src/lib/auth.ts`
- **Changes**:
  - Updated `signUpWithCredentials` to accept `canSell` boolean instead of role
  - All users now start as buyers with optional seller capabilities
  - Updated `User` interface to include `canSell` and `sellerVerified` fields
  - Modified `getCurrentUser` and `createUserProfile` functions

### 4. Signup Form Updates
- **File**: `src/app/auth/signup/page.tsx`
- **Changes**:
  - Removed role selection (buyer/seller)
  - Added checkbox for enabling seller capabilities
  - Updated form submission to use new structure
  - Added explanatory text about Stripe Connect onboarding requirement

### 5. Dashboard Updates
- **File**: `src/app/dashboard/page.tsx`
- **Changes**:
  - Updated logic to check `canSell` and `sellerVerified` instead of role
  - Added new "Seller Setup" tab for users who enabled seller capabilities but haven't completed onboarding
  - Modified tab navigation to show appropriate tabs based on user capabilities
  - Updated account information display to show new capability structure
  - Stats cards now show based on seller verification status

### 6. Stripe Integration Updates
- **File**: `src/app/api/create-stripe-account/route.ts`
- **Changes**:
  - Updated to check `can_sell` instead of role
  - Added proper error messages for users without seller capabilities
- **File**: `src/components/stripe/ConnectAccountButton.tsx`
- **Changes**: Updated to check `canSell` instead of role

### 7. Webhook Handler Updates
- **File**: `src/app/api/webhooks/stripe/route.ts`
- **Changes**: Added `account.updated` event handling to automatically update `seller_verified` status when Stripe Connect onboarding is completed

### 8. Create Listing Updates
- **File**: `src/app/dashboard/create-listing/page.tsx`
- **Changes**: Updated permission check to verify both `canSell` and `sellerVerified` instead of role

## User Experience Flow

### New User Signup
1. User fills out signup form with name, email, password
2. User optionally checks "Enable Seller Capabilities" checkbox
3. Account is created as a buyer with seller capabilities flag set accordingly

### Seller Capabilities Activation
1. User with seller capabilities enabled sees "Seller Setup" tab in dashboard
2. User clicks "Complete Stripe Setup" button
3. User is redirected to Stripe Connect onboarding
4. Upon completion, webhook automatically marks user as `seller_verified`
5. User now has access to seller features (create listings, receive payments)

### Dashboard Experience
- **Buyer Only**: Sees favorites, messages, and account tabs
- **Seller Capabilities Enabled (Not Verified)**: Sees buyer tabs + seller setup tab
- **Seller Verified**: Sees all tabs including listings, payments, and seller features

## Database Migration

### Running the Migration
1. Execute `scripts/add-seller-capabilities.sql` in your Supabase SQL Editor
2. The script is idempotent and can be run multiple times safely
3. Existing users are automatically migrated:
   - Users with `role = 'seller'` get `can_sell = true` and `seller_verified = true`
   - Users with `role = 'buyer'` get `can_sell = false` and `seller_verified = false`

### Testing the Migration
1. Run `scripts/test-seller-capabilities.sql` to verify the new fields exist
2. Check that existing user data has been properly migrated
3. Test creating new accounts with and without seller capabilities

## Benefits of the New System

1. **Unified Experience**: Users no longer need separate accounts for buying and selling
2. **Flexible Capabilities**: Users can enable seller features at any time
3. **Progressive Onboarding**: Seller features are unlocked progressively (capabilities → verification → full access)
4. **Better UX**: Clear guidance through the seller setup process
5. **Maintains Security**: Stripe Connect verification still required for receiving payments

## Backward Compatibility

- Existing buyer accounts continue to work unchanged
- Existing seller accounts are automatically migrated to the new structure
- All existing API endpoints continue to function
- Role field is maintained for backward compatibility but no longer used for access control

## Security Considerations

- Seller capabilities are controlled by database flags, not just UI state
- Stripe Connect verification is still required before receiving payments
- Webhook signature verification ensures secure status updates
- RLS policies continue to protect user data

## Future Enhancements

- Add ability for users to enable/disable seller capabilities after account creation
- Implement seller capability request/approval workflow
- Add seller capability expiration or renewal requirements
- Enhanced analytics for users with both buyer and seller activity
