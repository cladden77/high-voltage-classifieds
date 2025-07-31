# 🔧 RLS Performance Fixes

## 🚨 Issue Description

Supabase detected performance warnings in your RLS (Row Level Security) policies. There are **two main issues**:

1. **`auth.uid()` re-evaluation** - Calls are being re-evaluated for each row
2. **Multiple duplicate policies** - Same actions have multiple policies, causing performance overhead

## 📊 Affected Tables

The following tables had RLS performance issues:

1. **`public.notifications`** - Two policies affected
2. **`public.users`** - Three policies affected  
3. **`public.listings`** - Three policies affected
4. **`public.messages`** - Three policies affected
5. **`public.favorites`** - Three policies affected
6. **`public.orders`** - Three policies affected
7. **`public.payments`** - One policy affected

## 🔧 Solutions

### **Issue 1: auth.uid() Re-evaluation**

**Before (Performance Issue):**
```sql
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);
```

**After (Performance Optimized):**
```sql
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING ((select auth.uid()) = user_id);
```

### **Issue 2: Duplicate Policies**

**Problem:** Multiple policies for the same action (e.g., two "SELECT" policies for favorites)
**Solution:** Remove duplicates and keep only optimized policies

## 🎯 What Changed

- **Wrapped `auth.uid()` in `(select ...)`** - This prevents re-evaluation for each row
- **Removed duplicate policies** - Eliminated redundant policy definitions
- **Maintained same security** - No change to access control logic
- **Improved performance** - Better query execution at scale

## 📁 Files Created

### **`scripts/fix-notifications-rls-performance.sql`**
- Fixes only the notifications table RLS policies
- Quick fix for the specific warnings you received

### **`scripts/fix-all-rls-performance.sql`**
- Comprehensive fix for all tables with RLS performance issues
- **⚠️ Warning:** This created duplicate policies

### **`scripts/cleanup-duplicate-rls-policies.sql`** ⭐ **NEW**
- **Removes all duplicate policies**
- **Keeps only optimized policies**
- **Fixes the 60 warnings you received**
- **Recommended solution**

## 🚀 How to Apply

### **Option 1: Quick Fix (Notifications Only)**
```bash
# Run in Supabase SQL Editor
scripts/fix-notifications-rls-performance.sql
```

### **Option 2: Complete Fix (All Tables)**
```bash
# Run in Supabase SQL Editor
scripts/fix-all-rls-performance.sql
```

### **Option 3: Cleanup Duplicates (Recommended)** ⭐
```bash
# Run in Supabase SQL Editor
scripts/cleanup-duplicate-rls-policies.sql
```

## ✅ Verification

After running the cleanup script, you can verify the fixes:

```sql
-- Check all RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Show policy count per table
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

## 📈 Performance Benefits

- **Faster queries** - Reduced re-evaluation overhead
- **Eliminated duplicates** - No more multiple policy evaluation
- **Better scalability** - Improved performance at higher data volumes
- **Lower resource usage** - More efficient database operations
- **No security impact** - Same access control, better performance

## 🔍 Technical Details

### **Why Duplicates Happen:**
- Previous scripts created new policies without dropping old ones
- Multiple policies for same action = performance overhead
- PostgreSQL evaluates ALL policies for each query

### **Why The Fix Works:**
- `(select auth.uid())` is evaluated once per query
- Single policy per action = faster evaluation
- Dramatically reduces function call overhead

## 🎯 Next Steps

1. **Run the cleanup script** - `scripts/cleanup-duplicate-rls-policies.sql`
2. **Monitor performance** - Check if the 60 warnings disappear
3. **Test functionality** - Ensure all features still work correctly
4. **Consider similar fixes** - Apply to any new RLS policies you create

## 📚 References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select)
- [PostgreSQL RLS Best Practices](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) 