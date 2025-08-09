# Database Security - Production Protection

**CRITICAL: Protecting Real User Data from Accidental/Malicious Deletion**

## 🚨 Production Database Protection Strategies

### 1. Supabase Project-Level Security

#### Multiple Environment Strategy
```bash
# RECOMMENDED SETUP:
Development:  fgnosstvcukgdzztsnni.supabase.co  (current)
Staging:      [create-separate-project].supabase.co
Production:   [create-separate-project].supabase.co
```

#### Project Access Control
- **Organization Settings** → Add team members with specific roles
- **Database access** → Limit SQL Editor access to senior developers only
- **API keys** → Different keys for dev/staging/prod environments

### 2. Database User Permissions

#### Create Limited-Access Database Users
```sql
-- In production Supabase SQL Editor:

-- 1. Create read-only user for analytics/reporting
CREATE ROLE analytics_user WITH LOGIN PASSWORD 'secure_password_here';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;

-- 2. Create app-only user (no DDL permissions)  
CREATE ROLE app_user WITH LOGIN PASSWORD 'secure_password_here';
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_user;
-- Explicitly DENY DELETE and DROP permissions

-- 3. Reserve admin access for senior developers only
-- (Use Supabase dashboard owner account sparingly)
```

### 3. Row Level Security (RLS) Hardening

#### Prevent Mass Deletion Policies
```sql
-- Add deletion protection policies
CREATE POLICY "Prevent mass profile deletion"
  ON public.profiles FOR DELETE
  USING (
    -- Only allow self-deletion + rate limiting
    auth.uid() = id AND 
    -- Add additional checks like email confirmation
    (SELECT email_verified FROM auth.users WHERE id = auth.uid()) = true
  );

-- Protect critical data from deletion
CREATE POLICY "Crisis scenarios are read-only"
  ON public.crisis_scenarios FOR DELETE
  TO authenticated
  USING (false); -- No one can delete crisis scenarios
```

### 4. Application-Level Protection

#### Environment Variable Security
```bash
# .env.production (never commit to git)
NEXT_PUBLIC_SUPABASE_URL=https://production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=production_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=production_service_key_here

# .env.development  
NEXT_PUBLIC_SUPABASE_URL=https://fgnosstvcukgdzztsnni.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=development_anon_key_here
```

#### Code-Level Safeguards
```typescript
// lib/supabase/admin.ts - Service role client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
)

// Add deletion protection
export async function deleteUserProfile(userId: string) {
  // NEVER allow in production without multiple confirmations
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Profile deletion requires manual admin approval')
  }
  
  // Development only
  return supabase.from('profiles').delete().eq('id', userId)
}
```

### 5. Backup & Recovery Strategy

#### Automated Backups
```sql
-- Supabase Pro plan includes:
-- - Point-in-time recovery (7 days)
-- - Daily automated backups
-- - Manual backup creation before major changes

-- Manual backup before dangerous operations:
-- 1. Go to Supabase Dashboard → Settings → Database
-- 2. Create manual backup with descriptive name
-- 3. Download backup file to secure location
```

#### Database Migration Safety
```sql
-- Before running any schema changes in production:

-- 1. Create backup
SELECT 'Creating backup before schema change' as status;

-- 2. Test on staging first
-- Never run untested migrations on production

-- 3. Use transactions for safety
BEGIN;
  -- Schema changes here
  -- Test queries to verify
ROLLBACK; -- or COMMIT if everything looks good
```

### 6. Monitoring & Alerting

#### Database Activity Monitoring
```sql
-- Monitor dangerous operations
-- Set up alerts for:
-- - Mass DELETE operations (>100 rows)
-- - DROP TABLE commands
-- - Schema modifications
-- - Unusual API key usage patterns

-- Supabase Dashboard → Logs → Database logs
-- Set up webhook alerts for critical operations
```

#### Application Monitoring
```typescript
// middleware/security.ts
export function auditDatabaseOperation(operation: string, table: string, count: number) {
  if (operation === 'DELETE' && count > 10) {
    // Alert administrators immediately
    sendSecurityAlert({
      type: 'MASS_DELETE_DETECTED',
      table,
      count,
      timestamp: new Date(),
      user: getCurrentUser()
    })
  }
}
```

### 7. Team Access Management

#### Developer Access Levels
```
🔴 PRODUCTION ACCESS (Owners only):
- Full database admin rights
- Can delete/modify schema
- Access to service role key

🟡 STAGING ACCESS (Senior developers):
- Full testing environment access  
- Can test destructive operations safely
- No production access

🟢 DEVELOPMENT ACCESS (All developers):
- Local development environment
- Can reset/modify dev database freely
- No access to user data
```

#### Access Audit Trail
- Supabase tracks all API calls and database operations
- Regular access reviews (monthly)
- Revoke access for former team members immediately
- Use individual accounts (never share credentials)

### 8. Emergency Response Plan

#### If Accidental Deletion Occurs
```sql
-- IMMEDIATE RESPONSE:

-- 1. Stop application traffic (maintenance mode)
UPDATE public.profiles SET updated_at = updated_at; -- Trigger alerts

-- 2. Assess damage scope
SELECT COUNT(*) FROM public.profiles; -- Check remaining records
SELECT COUNT(*) FROM public.user_responses; -- Check user data

-- 3. Restore from backup (Supabase Dashboard)
-- Settings → Database → Backups → Restore point-in-time

-- 4. Verify data integrity after restore
-- Run verification queries

-- 5. Investigation and prevention
-- Review audit logs, update security policies
```

### 9. Development Workflow Security

#### Safe Development Practices
```bash
# NEVER run these commands on production:
# - DROP TABLE
# - DELETE FROM table_name (without WHERE clause)  
# - TRUNCATE TABLE
# - ALTER TABLE DROP COLUMN

# ALWAYS:
# - Use staging environment for testing
# - Create backups before schema changes
# - Use transactions for multi-step operations
# - Code review for database changes
```

#### Git Security
```bash
# .gitignore (ensure these are never committed)
.env.local
.env.production
supabase/.env
database-backups/
*.sql.backup

# Never commit:
# - Production API keys
# - Database passwords  
# - Backup files
# - User data exports
```

### 10. Compliance & Legal

#### GDPR/Data Protection
```sql
-- User data deletion (when legally required)
CREATE FUNCTION secure_user_deletion(user_email TEXT)
RETURNS void AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Multi-step verification process
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Log deletion request
  INSERT INTO audit_log (action, user_id, timestamp, reason)
  VALUES ('USER_DELETION_REQUEST', user_id, NOW(), 'GDPR_COMPLIANCE');
  
  -- Actual deletion (with cascading)
  DELETE FROM auth.users WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;
```

## 🎯 Implementation Checklist

- [ ] Create separate Supabase projects for dev/staging/prod
- [ ] Set up limited database user roles
- [ ] Implement deletion protection RLS policies  
- [ ] Configure automated backups
- [ ] Set up monitoring and alerts
- [ ] Document emergency response procedures
- [ ] Train team on security practices
- [ ] Regular security audits (quarterly)

**Remember: Prevention is better than recovery. Multiple layers of protection prevent catastrophic data loss.**