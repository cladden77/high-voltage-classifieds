# 🗄️ Supabase Database Setup Guide

This guide will help you set up the complete database schema for your High Voltage Classifieds platform.

## 📋 Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Supabase Project**: Create a new project for your classifieds platform
3. **Environment Variables**: Have your Supabase credentials ready

## 🚀 Step-by-Step Setup

### Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings > API**
3. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### Step 2: Create Environment Variables

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional: Other integrations
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
HUBSPOT_API_KEY=your_hubspot_api_key
MAILCHIMP_API_KEY=your_mailchimp_api_key
MAILCHIMP_AUDIENCE_ID=your_mailchimp_audience_id
```

### Step 3: Run the Database Schema

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy the entire contents of `supabase-schema.sql`
4. Paste it into the SQL Editor
5. Click **RUN** to execute the schema

This will create:
- ✅ All required tables (users, listings, messages, favorites, orders)
- ✅ Row Level Security (RLS) policies
- ✅ Database indexes for performance
- ✅ Storage bucket for images
- ✅ Helper functions and views

### Step 4: Test User Authentication

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3001/auth/signup`

3. Create test accounts:
   - **Seller Account**: Create a seller profile
   - **Buyer Account**: Create a buyer profile

4. Check Supabase Dashboard:
   - Go to **Authentication > Users**
   - Verify your test users were created
   - Copy their User IDs for the next step

### Step 5: Add Sample Data (Optional)

1. Open `supabase-seed-data.sql`
2. Replace placeholder UUIDs with real user IDs from Step 4:
   - Replace `00000000-0000-0000-0000-000000000001` with your seller's ID
   - Replace `00000000-0000-0000-0000-000000000002` with your buyer's ID
3. Uncomment the user profile INSERT statements
4. Update the email addresses to match your test accounts
5. Run the seed data script in Supabase SQL Editor

This will add:
- 6 sample listings across different categories
- User profiles with bio and company info
- Sample message conversation
- Favorites for testing
- Analytics data

### Step 6: Verify Everything Works

Test these features in your application:

#### Authentication ✅
- Sign up new users
- Sign in existing users
- User profile creation

#### Listings ✅
- View listings page: `http://localhost:3001/listings`
- Create new listings (as seller)
- Search and filter listings
- View individual listing details

#### Dashboard ✅
- Seller dashboard: `http://localhost:3001/dashboard`
- Listing management
- View analytics

#### Messaging ✅
- Send messages between users
- View message history

#### Favorites ✅
- Add/remove favorites
- View saved listings

## 🔧 Database Tables Overview

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `users` | User profiles | Extends Supabase auth with roles, bio, company info |
| `listings` | Equipment listings | Title, description, price, images, seller info |
| `messages` | In-app messaging | Conversations between buyers and sellers |
| `favorites` | Saved listings | Users can save listings for later |
| `orders` | Payment tracking | Stripe/PayPal order management |
| `user_analytics` | User statistics | Listing counts, sales, revenue tracking |

## 🔒 Security Features

### Row Level Security (RLS)
- **Users**: Can only edit their own profile
- **Listings**: Sellers can only modify their own listings
- **Messages**: Users can only see their own conversations
- **Favorites**: Users can only manage their own favorites
- **Orders**: Buyers and sellers can only see relevant orders

### Storage Security
- **Images**: Public read access, authenticated upload only
- **File Organization**: Images organized by user ID folders

## 🛠️ Useful SQL Queries

### Check Platform Statistics
```sql
SELECT * FROM get_platform_stats();
```

### View All Listings with Seller Info (Using Secure Functions)
```sql
-- Get all listings (equivalent to old listing_details view)
SELECT * FROM public.get_all_listings() ORDER BY created_at DESC;

-- Or with parameters for filtering/pagination
SELECT * FROM public.get_listing_details(10, 0, 'Electronics', NULL);
```

### View Message Threads (Using Secure Functions)
```sql
-- Get all message threads for current user
SELECT * FROM public.get_user_message_threads();

-- Or get threads for a specific user (admin use)
SELECT * FROM public.get_message_threads('user-uuid-here');
```

### Clear All Test Data
```sql
SELECT clear_all_data();
```

## 🚨 Troubleshooting

### Common Issues

**1. RLS Policy Errors**
- Make sure users are properly authenticated
- Check that user IDs match between auth.users and public.users

**2. Storage Upload Issues**
- Verify storage policies are correctly set
- Check file size limits (default 50MB)

**3. Database Connection Errors**
- Verify environment variables are correct
- Check Supabase project is active

**4. Seed Data Issues**
- Ensure you've replaced placeholder UUIDs with real user IDs
- Make sure auth users exist before creating profiles

### Debug Queries

**Check if tables exist:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

**Verify RLS policies:**
```sql
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

**Check storage bucket:**
```sql
SELECT * FROM storage.buckets;
```

## 🎯 Next Steps

Once your database is set up:

1. **Test Core Features**: Try creating listings, messaging, favorites
2. **Add Real Content**: Replace sample data with real listings
3. **Configure Payments**: Set up Stripe/PayPal webhooks
4. **Customize Categories**: Modify listing categories for your market
5. **Deploy to Production**: Set up production Supabase project

## 📞 Support

If you run into issues:
1. Check the Supabase logs in your dashboard
2. Verify environment variables are correct
3. Ensure all SQL scripts ran without errors
4. Test with simple auth operations first

Your High Voltage Classifieds platform is now ready for testing and development! 🚀 