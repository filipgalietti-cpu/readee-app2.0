# Security Notice

## ⚠️ IMPORTANT: Rotate Supabase Credentials

If you were using this repository before the fix on February 13, 2026, **you must rotate your Supabase credentials immediately**.

### Why?

Supabase credentials (URL and service role key) were previously hardcoded in the source code and committed to git history. Even though they have been removed from the current code, they remain in the git history and should be considered compromised.

### What to Do

1. **Go to your Supabase Dashboard**: https://app.supabase.com/project/_/settings/api
2. **Rotate the following credentials**:
   - Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`)
   - Optionally, you can also rotate the Anonymous Key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
3. **Update your `.env.local` file** with the new credentials
4. **Restart your development server** for the changes to take effect

### Current Security Measures

- ✅ All Supabase credentials are now loaded from environment variables
- ✅ `.env*` files are gitignored (except `.env.example`)
- ✅ No secrets are hardcoded in the source code

### Best Practices

- **Never commit** `.env`, `.env.local`, or other environment files containing actual secrets
- **Always use** environment variables for sensitive configuration
- **Rotate credentials** immediately if they are accidentally exposed
- **Review** the `.env.example` file to understand required environment variables
