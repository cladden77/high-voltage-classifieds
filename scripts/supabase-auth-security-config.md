# Supabase Auth Security Configuration

## Auth Security Warnings to Fix

### 1. OTP Long Expiry Warning

**Issue**: OTP expiry exceeds recommended threshold (currently > 1 hour)  
**Recommendation**: Set to less than 1 hour for security

**How to Fix**:
1. Go to **Supabase Dashboard** → **Authentication** → **Settings**
2. Find **"Email OTP expiry"** setting
3. Change from current value to **3600 seconds (1 hour)** or less
4. Recommended: **1800 seconds (30 minutes)** for better security
5. Click **Save**

### 2. Leaked Password Protection Disabled

**Issue**: Password breach protection is currently disabled  
**Recommendation**: Enable HaveIBeenPwned.org integration

**How to Fix**:
1. Go to **Supabase Dashboard** → **Authentication** → **Settings** 
2. Find **"Password Protection"** section
3. Enable **"Leaked Password Protection"**
4. This will check passwords against HaveIBeenPwned.org database
5. Click **Save**

## Security Benefits

✅ **OTP Security**: Shorter expiry reduces window for attack  
✅ **Password Security**: Prevents use of compromised passwords  
✅ **Industry Standard**: Follows security best practices  
✅ **Zero Code Changes**: Pure configuration fixes

## Implementation Status

- [ ] Fix OTP expiry to ≤ 1 hour  
- [ ] Enable leaked password protection  
- [x] Fix function search_path security warnings (via SQL script)

## Notes

These are **configuration-only changes** in the Supabase dashboard - no code deployment required. Both settings enhance security without affecting user experience.