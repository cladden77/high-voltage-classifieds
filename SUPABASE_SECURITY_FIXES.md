# Supabase Security Fixes Guide

## Overview
This guide addresses two security warnings from Supabase:
1. **Function Search Path Mutable** - Security warning for database functions
2. **Leaked Password Protection Disabled** - Auth security feature

## 🔧 Fix 1: Function Search Path Mutable

### Issue
Function `public.create_notification` has a role mutable search_path, which is a security concern.

### Solution
Run this SQL script in your Supabase SQL Editor:

```sql
-- Fix Function Search Path Security Warning
-- This script fixes the search_path security warning for the create_notification function

-- Recreate the create_notification function with fixed search_path
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_type TEXT DEFAULT 'info',
    p_related_id TEXT DEFAULT NULL,
    p_related_type TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        related_id,
        related_type
    ) VALUES (
        p_user_id,
        p_title,
        p_message,
        p_type,
        p_related_id,
        p_related_type
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_notification(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
```

### What This Fixes
- **Before**: Function has mutable search_path (security risk)
- **After**: Function has fixed search_path = public (secure)

## 🔒 Fix 2: Leaked Password Protection

### Issue
Leaked password protection is currently disabled. This feature prevents users from using compromised passwords.

### Solution
Enable this feature in your Supabase Dashboard:

1. **Go to Supabase Dashboard** → Your Project
2. **Navigate to Authentication** → Settings
3. **Find "Password Strength"** section
4. **Enable "Leaked password protection"**
5. **Save changes**

### What This Fixes
- **Before**: Users can use compromised passwords from data breaches
- **After**: Supabase checks passwords against HaveIBeenPwned.org database

## 📋 Complete Fix Process

### Step 1: Fix Function Search Path
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the SQL script above
3. Run the script
4. Verify the function is updated

### Step 2: Enable Password Protection
1. Go to Authentication → Settings
2. Enable "Leaked password protection"
3. Save changes

### Step 3: Verify Fixes
1. Check Supabase Linter again
2. Both warnings should be resolved

## 🔍 Verification

After applying both fixes:

1. **Function Search Path**: Should show no more warnings about `create_notification`
2. **Password Protection**: Should show as enabled in Auth settings
3. **Overall Security Score**: Should improve in Supabase dashboard

## 🛡️ Security Benefits

### Function Search Path Fix
- **Prevents SQL injection** through search_path manipulation
- **Ensures consistent behavior** regardless of user's search_path
- **Follows security best practices** for database functions

### Password Protection Fix
- **Prevents weak passwords** from data breaches
- **Enhances user account security**
- **Reduces risk of account compromise**

## 📚 Additional Resources

- [Supabase Function Security](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)
- [Password Security Guide](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
- [RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)

## ⚠️ Important Notes

- **Test thoroughly** after applying these fixes
- **Monitor function behavior** to ensure notifications still work
- **Inform users** about password policy changes
- **Backup database** before making changes (recommended)
