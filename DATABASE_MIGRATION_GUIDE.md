# Database Migration Guide

## Issue
You're getting a profile creation error when new users sign up because the database is missing the `can_sell` and `seller_verified` fields that the application expects.

## Solution
Run the database migration script to add the missing fields.

## Steps

### 1. Open Supabase Dashboard
- Go to your Supabase project dashboard
- Navigate to **SQL Editor**

### 2. Run the Migration Script
Copy and paste the entire contents of `scripts/add-seller-capabilities.sql` into the SQL Editor and click **RUN**.

This script will:
- Add `can_sell` field (boolean, defaults to false)
- Add `seller_verified` field (boolean, defaults to false)  
- Add `seller_verification_date` field (timestamp)
- Create indexes for better performance
- Update existing users appropriately

### 3. Verify the Migration
After running the script, you can verify it worked by running this query:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('can_sell', 'seller_verified', 'seller_verification_date');
```

You should see the three new columns listed.

### 4. Test User Signup
Try creating a new user account with seller capabilities enabled. The profile creation should now work without errors.

## Alternative Solution
If you can't run the migration immediately, the application has been updated to handle missing fields gracefully. It will:
1. Try to create a profile with seller fields
2. If that fails, create a basic profile without seller fields
3. Try to update the profile with seller fields if needed

This ensures users can still sign up even if the database migration hasn't been run yet.

