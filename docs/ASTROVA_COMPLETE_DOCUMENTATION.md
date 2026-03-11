# Astrova Complete Documentation Hub

## Table of Contents

1. [Database Cleaning Guide](#database-cleaning-guide)
2. [API Issues Analysis](#api-issues-analysis)  
3. [Comprehensive Crisis Analysis](#comprehensive-crisis-analysis)

---

## Database Cleaning Guide

### Quick Usage

```bash
# Make sure DATABASE_URL is set
export DATABASE_URL="postgres://user:password@your-neon-host/astrova?sslmode=require"

# Run the cleaning script
./clean-db.sh [level]
```

### Cleaning Levels

#### Soft Clean (Default)
- **What it removes**: Chat sessions, credit logs
- **What it keeps**: User accounts, settings, saved charts, knowledge base
- **Use case**: Clear activity data while preserving user accounts

```bash
./clean-db.sh soft
```

#### Medium Clean
- **What it removes**: Chat sessions, credit logs, saved charts, user settings
- **What it keeps**: User accounts (with reset credits), knowledge base, admin config
- **Use case**: Fresh start for existing users

```bash
./clean-db.sh medium
```

#### Hard Clean
- **What it removes**: All user data including accounts
- **What it keeps**: Knowledge base, admin config, enabled models
- **Use case**: Remove all user data but preserve system configuration

```bash
./clean-db.sh hard
```

#### Complete Reset
- **What it removes**: Everything
- **What it keeps**: Nothing (recreates empty schema)
- **Use case**: Complete database wipe for fresh installation

```bash
./clean-db.sh reset
```

### Manual SQL Commands

If you prefer to run SQL directly:

#### Check Current Data
```sql
SELECT
  'users' as table_name, count(*) as row_count FROM users
UNION ALL
SELECT 'chat_sessions', count(*) FROM chat_sessions
UNION ALL
SELECT 'saved_charts', count(*) FROM saved_charts
UNION ALL
SELECT 'credit_transactions', count(*) FROM credit_transactions;
```

#### Soft Clean (Manual)
```sql
DELETE FROM chat_sessions;
DELETE FROM credit_transactions;
```

#### Medium Clean (Manual)
```sql
DELETE FROM chat_sessions;
DELETE FROM credit_transactions;
DELETE FROM saved_charts;
DELETE FROM user_settings;
UPDATE users SET credits = 10, credits_used = 0, last_login_at = NULL;
```

#### Hard Clean (Manual)
```sql
DELETE FROM users;
```

### Safety Features

- **Confirmation prompts**: All operations require explicit confirmation
- **Cascade deletes**: Properly handles foreign key relationships
- **Environment check**: Verifies DATABASE_URL is set before proceeding
- **Non-destructive by default**: Uses "soft" clean if no level specified

### Backup Recommendations

Before any cleaning operation:

1. **Export your data**:
```bash
pg_dump "$DATABASE_URL" > backup-$(date +%Y%m%d).sql
```

2. **Test on staging**: Always test cleaning operations on a staging database first

3. **Know your data**: Check what data exists before cleaning

### Data Retention by Level

| Level | Users | Sessions | Charts | Settings | Credits | KB | Config |
|-------|-------|----------|--------|----------|---------|----|---------|
| Soft  | ✅    | ❌       | ✅     | ✅       | ✅      | ✅ | ✅     |
| Medium| ✅    | ❌       | ❌     | ❌       | 🔄      | ✅ | ✅     |
| Hard  | ❌    | ❌       | ❌     | ❌       | ❌      | ✅ | ✅     |
| Reset | ❌    | ❌       | ❌     | ❌       | ❌      | ❌ | ❌     |

🔄 = Reset to default values

---

## API Issues Analysis

### Problem Summary

After database cleaning, the application is encountering several API errors:

1. **403 Forbidden** on `/api/admin/config` endpoints
2. **400 Bad Request** on `/api/credits/claim-free` endpoint

### Comprehensive Analysis

#### 1. Critical Schema Inconsistency Found

**Root Cause**: There are **TWO different database schemas** in the codebase:

##### Schema A: `neon-schema.sql` (File-based schema)
- Uses prefix `astrova_` for all tables
- Tables: `astrova_users`, `astrova_credit_log`, `astrova_knowledge_base`, etc.
- Uses `TEXT` primary keys with `gen_random_uuid()::text`
- Uses `TIMESTAMPTZ` for timestamps

##### Schema B: `api/_lib/db.ts` (Code-based schema)  
- Uses NO prefix for table names
- Tables: `users`, `credit_transactions`, `knowledge_base`, etc.
- Uses `UUID` primary keys with `gen_random_uuid()`
- Uses `TIMESTAMPTZ` for timestamps

#### 2. Table Name Mismatch Analysis

**Files using incorrect table names (referencing `users` instead of `astrova_users`):**

| File | Lines | Impact |
|------|-------|--------|
| `api/_lib/auth.ts` | 5 locations | Auth, admin checks, user validation |
| `api/credits/index.ts` | 3 locations | Credit operations |
| `api/credits/claim-free.ts` | 3 locations | Free credit claims |
| `api/users/[id].ts` | 5 locations | User management |
| `api/users.ts` | 4 locations | User operations |
| `api/users/all.ts` | 1 location | User listing |
| `api/auth/session.ts` | 1 location | Session handling |

**Total: 22 incorrect table references across 8 files**

#### 3. Vercel Edge Function Configuration

**Vercel Setup Analysis:**
- `vercel.json` correctly configured for Vite framework
- API rewrites: `/api/(.*)` → `/api/$1` ✅
- Edge Functions runtime: `edge` specified in all API files ✅
- Database connection: Uses `@neondatabase/serverless` ✅

**No Vercel configuration issues detected.**

#### 4. Authentication Flow Analysis

**Session Management:**
- Uses `magnova_session` cookie (httpOnly) ✅
- Contains Firebase UID directly from auth.magnova.ai ✅
- `requireAuth()` validates session and creates users if missing ✅

**Authentication Issues:**
- References wrong table name (`users` vs `astrova_users`)
- User creation fails due to table mismatch
- Admin role checks fail because users don't exist in correct table

#### 5. Credit Transaction System Analysis

**Credit Tables Mismatch:**
- Schema A: `astrova_credit_log` 
- Schema B: `credit_transactions`
- API code references `credit_transactions` but schema has `astrova_credit_log`

**Credit Flow Issues:**
- Claim-free checks `credit_transactions` table (doesn't exist)
- Credit operations reference wrong table names
- Transaction logging fails silently

#### 6. Database Initialization Conflict

**Two competing initialization systems:**

1. **Manual schema**: `neon-schema.sql`
   - Run manually via `psql`
   - Creates `astrova_*` tables
   - Used during initial setup

2. **Auto schema**: `api/_lib/db.ts` `ensureSchema()`
   - Runs automatically on first API call
   - Creates unprefixed tables
   - Used by Edge Functions

**Current State**: Both schemas exist in database, causing confusion.

### Detailed Error Breakdown

#### 1. Admin Config 403 Errors

**Chain of failures:**
1. Frontend requests `/api/admin/config?key=credit_costs`
2. API calls `requireAuth()` → fails to find user in `users` table
3. If user creation succeeds, `requireAdmin()` fails because user has no admin role
4. Returns 403 Forbidden

**Actual error**: User doesn't exist in `users` table, only in `astrova_users`

#### 2. Credits Claim-Free 400 Error

**Chain of failures:**
1. Frontend requests `POST /api/credits/claim-free`
2. API calls `requireAuth()` → user lookup fails in `users` table
3. User creation attempt fails because `users` table doesn't exist
4. Returns 400 Bad Request (from auth failure)

**Actual error**: `users` table doesn't exist, only `astrova_users`

### Solutions

#### Option 1: Standardize on `astrova_*` Schema (Recommended)

**Pros:**
- Consistent with existing manual schema
- Clear table naming convention
- Matches current database state

**Cons:**
- Requires updating 22+ table references
- Need to update credit transaction table name

**Files to update:**
- All API files (22 locations)
- Update `credit_transactions` → `astrova_credit_log`

#### Option 2: Standardize on Unprefixed Schema

**Pros:**
- Less typing in queries
- Simpler table names

**Cons:**
- Need to migrate existing data from `astrova_*` tables
- Inconsistent with manual schema file

#### Option 3: Hybrid Approach (Not Recommended)

**Pros:**
- Minimal changes

**Cons:**
- Confusing maintenance
- Schema drift over time

### Immediate Fix Steps

#### Step 1: Choose Schema Standard
**Recommendation**: Use `astrova_*` schema (Option 1)

#### Step 2: Update All API Files
Replace all table references:
- `users` → `astrova_users`
- `credit_transactions` → `astrova_credit_log`
- `knowledge_base` → `astrova_knowledge_base`
- etc.

#### Step 3: Create Admin User
```sql
INSERT INTO astrova_users (firebase_uid, email, display_name, role, credits)
VALUES ('your-firebase-uid', 'admin@example.com', 'Admin', 'admin', 1000);
```

#### Step 4: Test Endpoints
- Admin config should return 200
- Claim-free should work for new users

### Prevention Measures

#### 1. Schema Constants
```typescript
// Create constants file
export const TABLES = {
  USERS: 'astrova_users',
  CREDIT_LOG: 'astrova_credit_log',
  KNOWLEDGE_BASE: 'astrova_knowledge_base',
  // etc...
} as const;
```

#### 2. Single Source of Truth
- Remove duplicate schema in `api/_lib/db.ts`
- Use only `neon-schema.sql` for schema definition
- Add migration system for schema updates

#### 3. Automated Testing
- Integration tests for all API endpoints
- Schema validation tests
- Table existence checks

#### 4. Environment Validation
- Startup validation that all required tables exist
- Admin user seeding in development
- Clear error messages for missing tables

### Code Examples

#### Before (Broken)
```typescript
const rows = await sql`SELECT id, role FROM users WHERE firebase_uid = ${authPayload.firebase_uid} LIMIT 1`;
const log = await sql`SELECT 1 FROM credit_transactions WHERE user_id = ${auth.id} AND type = ${'free_claim'}`;
```

#### After (Fixed)
```typescript
const rows = await sql`SELECT id, role FROM astrova_users WHERE firebase_uid = ${authPayload.firebase_uid} LIMIT 1`;
const log = await sql`SELECT 1 FROM astrova_credit_log WHERE user_id = ${auth.id} AND type = ${'free_claim'}`;
```

#### Schema Constants (Prevention)
```typescript
import { TABLES } from '../_lib/tables';

const rows = await sql`SELECT id, role FROM ${TABLES.USERS} WHERE firebase_uid = ${authPayload.firebase_uid} LIMIT 1`;
const log = await sql`SELECT 1 FROM ${TABLES.CREDIT_LOG} WHERE user_id = ${auth.id} AND type = ${'free_claim'}`;
```

### Priority Actions

1. **URGENT**: Fix table name mismatches (22 locations)
2. **HIGH**: Create admin user for testing
3. **MEDIUM**: Implement schema constants
4. **LOW**: Remove duplicate schema initialization

---

## Comprehensive Crisis Analysis

### Executive Summary

**CRITICAL**: Astrova is experiencing a complete system failure due to fundamental database schema conflicts. The application has TWO competing database schemas that are mutually incompatible, causing all API endpoints to fail with 403/400 errors.

**Impact**: 100% of authenticated API functionality is broken. Users cannot access admin features, claim credits, or perform any database operations.

**Root Cause**: Schema drift between manual schema (`neon-schema.sql`) and auto-initialized schema (`api/_lib/db.ts`) creating a "split-brain" database state.

### 1. CRITICAL DATABASE SCHEMA CONFLICT

#### The Two Competing Schemas

##### Schema A: `neon-schema.sql` (Manual/Production Schema)
```sql
-- Table names with astrova_ prefix
astrova_users (id TEXT, firebase_uid TEXT, ...)
astrova_credit_log (user_id TEXT, ...)
astrova_knowledge_base (id TEXT, ...)
astrova_admin_config (config_key TEXT, ...)
astrova_user_settings (user_id TEXT, ...)
astrova_chat_sessions (user_id TEXT, ...)
astrova_saved_charts (user_id TEXT, ...)
enabled_models (model_id TEXT, ...)
```

##### Schema B: `api/_lib/db.ts` (Auto-Initialized Schema)
```sql
-- Table names without prefix
users (id UUID, firebase_uid TEXT, ...)
credit_transactions (user_id UUID, ...)
knowledge_base (id UUID, ...)
admin_config (config_key TEXT, ...)
user_settings (user_id UUID, ...)
chat_sessions (user_id UUID, ...)
saved_charts (user_id UUID, ...)
enabled_models (model_id TEXT, ...)
```

#### Key Differences

| Aspect | Schema A | Schema B |
|--------|----------|----------|
| **Table Prefix** | `astrova_` | None |
| **Primary Key Type** | `TEXT` (gen_random_uuid()::text) | `UUID` (gen_random_uuid()) |
| **Credit Table** | `astrova_credit_log` | `credit_transactions` |
| **Initialization** | Manual via psql | Automatic via ensureSchema() |
| **User ID Type** | TEXT | UUID |

### 2. COMPLETE API FAILURE ANALYSIS

#### 2.1 Admin Config 403 Errors

**Error Chain:**
```
Frontend → GET /api/admin/config?key=credit_costs
↓
API → requireAuth() → extractSessionToken()
↓
Auth → sql`SELECT * FROM users WHERE firebase_uid = ?` 
↓
FAIL: 'users' table doesn't exist (only 'astrova_users' exists)
↓
Response: 403 Forbidden
```

**Affected Endpoints:**
- `/api/admin/config?key=credit_costs`
- `/api/admin/config?key=default_model`
- ALL admin configuration endpoints

#### 2.2 Credits Claim-Free 400 Errors

**Error Chain:**
```
Frontend → POST /api/credits/claim-free
↓
API → requireAuth() → user lookup in 'users' table
↓
FAIL: Table 'users' doesn't exist
↓
User creation attempt: INSERT INTO users...
↓
FAIL: Table 'users' doesn't exist
↓
Response: 400 Bad Request
```

**Affected Endpoints:**
- `/api/credits/claim-free`
- All credit-related endpoints

#### 2.3 Authentication System Breakdown

**Dual Authentication Sources:**
1. **Firebase Local**: Direct Firebase Auth integration
2. **Magnova Centralized**: Cross-app SSO via auth.magnova.ai

**Auth Flow Issues:**
- Session sync calls `/api/auth/session` which references wrong tables
- User creation fails due to table mismatch
- Admin role checks fail because users don't exist in expected table

### 3. FRONTEND IMPACT ANALYSIS

#### 3.1 API Client Configuration

**File:** `src/lib/api.ts`
- **Base URL**: `import.meta.env.VITE_API_URL || 'localhost:10000'`
- **Error Handling**: Silent failures (returns null on 403/400)
- **Timeout**: 15 seconds
- **Credentials**: include (for cookies)

#### 3.2 Frontend Error Handling

**Current Behavior:**
```typescript
if (response.status === 403) {
  console.warn(`[api] 401 on ${path} — unauthorized`);
  return null;  // Silent failure!
}
if (!response.ok) {
  console.error(`[api] ${path} ${response.status}`);
  return null;  // Silent failure!
}
```

**Problem**: Frontend silently swallows all API errors, making debugging impossible.

#### 3.3 Authentication Context

**File:** `src/contexts/AuthContext.tsx`
- **Dual Auth**: Firebase + Magnova SSO
- **Session Sync**: Cross-app authentication via auth.magnova.ai
- **Error Handling**: Basic console logging only

### 4. ENVIRONMENT & CONFIGURATION ANALYSIS

#### 4.1 Required Environment Variables

**Database:**
```bash
DATABASE_URL=postgresql://neondb_owner:npg_gQidph2aD5ve@ep-lucky-base-adb8u56x-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Firebase (Optional):**
```bash
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

**Admin:**
```bash
VITE_ADMIN_EMAILS=admin@example.com
SESSION_COOKIE_DOMAIN=  # Empty for localhost
```

#### 4.2 Vercel Configuration

**File:** `vercel.json`
```json
{
  "framework": "vite",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Status**: ✅ Correctly configured

### 5. DATABASE CURRENT STATE

#### 5.1 Tables Currently Exist

Based on schema initialization, BOTH sets of tables likely exist:
- `astrova_users` (from manual schema)
- `users` (from auto schema, if any API was called)
- `astrova_credit_log` + `credit_transactions` (both)
- All other table pairs

#### 5.2 Data Inconsistency

**User Data Split:**
- Manual users in `astrova_users`
- Auto-created users in `users` (if any)
- No synchronization between the two

**Credit Data Split:**
- Manual credit logs in `astrova_credit_log`
- Auto credit logs in `credit_transactions`
- Credit balance queries reference wrong table

### 6. COMPLETE API ENDPOINT ANALYSIS

#### 6.1 All Affected Endpoints

**Authentication (100% broken):**
- `/api/auth/session` - Wrong table references
- `/api/auth/signout` - Depends on session

**Admin (100% broken):**
- `/api/admin/config` - Admin check fails
- All admin endpoints require admin role check

**Credits (100% broken):**
- `/api/credits/claim-free` - User creation fails
- `/api/credits` - User lookup fails
- `/api/credits/log` - Wrong table name

**Users (100% broken):**
- `/api/users/[id]` - Wrong table references
- `/api/users` - User creation fails
- `/api/users/all` - Wrong table name

**All Other Endpoints (100% broken):**
- Every endpoint uses `requireAuth()` → fails
- Every database query uses wrong table names

#### 6.2 Table Reference Mapping

| API File | Wrong Table | Correct Table | Impact |
|----------|-------------|----------------|--------|
| `api/_lib/auth.ts` | `users` (5x) | `astrova_users` | Auth failure |
| `api/credits/index.ts` | `users` (3x) | `astrova_users` | Credits broken |
| `api/credits/claim-free.ts` | `users` (3x) | `astrova_users` | Claims broken |
| `api/users/[id].ts` | `users` (5x) | `astrova_users` | User management broken |
| `api/users.ts` | `users` (4x) | `astrova_users` | User operations broken |
| `api/users/all.ts` | `users` (1x) | `astrova_users` | User listing broken |
| `api/auth/session.ts` | `users` (1x) | `astrova_users` | Session sync broken |

**Total: 22 incorrect table references across 8 files**

### 7. TECHNICAL DEBT ANALYSIS

#### 7.1 Schema Management Issues

**Problems:**
- No single source of truth for schema
- Manual and automatic schema creation compete
- No migration system
- No schema versioning

**Consequences:**
- Schema drift inevitable
- Deployment failures likely
- Data inconsistency guaranteed

#### 7.2 Code Organization Issues

**Problems:**
- Hardcoded table names throughout codebase
- No schema constants
- No database abstraction layer
- Inconsistent naming conventions

**Consequences:**
- Maintenance nightmare
- Easy to introduce bugs
- Difficult to refactor

#### 7.3 Error Handling Issues

**Problems:**
- Silent failures in frontend
- Poor error messages
- No error boundaries
- No retry logic

**Consequences:**
- Impossible to debug
- Poor user experience
- Hidden system failures

### 8. IMMEDIATE CRITICAL FIXES

#### 8.1 URGENT: Schema Standardization

**Option A: Standardize on astrova_* (RECOMMENDED)**
```sql
-- Keep existing astrova_* tables
-- Drop all unprefixed tables
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS credit_transactions CASCADE;
-- etc.
```

**Option B: Standardize on unprefixed**
```sql
-- Migrate data from astrova_* to unprefixed
-- More complex, data loss risk
```

#### 8.2 URGENT: Fix All Table References

**Files requiring updates (22 total changes):**
1. `api/_lib/auth.ts` - 5 changes
2. `api/credits/index.ts` - 3 changes  
3. `api/credits/claim-free.ts` - 3 changes
4. `api/users/[id].ts` - 5 changes
5. `api/users.ts` - 4 changes
6. `api/users/all.ts` - 1 change
7. `api/auth/session.ts` - 1 change

#### 8.3 URGENT: Create Admin User

```sql
INSERT INTO astrova_users (firebase_uid, email, display_name, role, credits)
VALUES ('admin-firebase-uid', 'admin@example.com', 'Admin', 'admin', 1000);
```

### 9. COMPREHENSIVE SOLUTION ROADMAP

#### Phase 1: Emergency Stabilization (Immediate)

1. **Choose schema standard** (recommend astrova_*)
2. **Fix all 22 table references**
3. **Create admin user**
4. **Test critical endpoints**

#### Phase 2: System Hardening (Week 1)

1. **Implement schema constants**
2. **Add table existence validation**
3. **Remove duplicate schema initialization**
4. **Add proper error handling**

#### Phase 3: Architecture Improvement (Week 2)

1. **Single schema source of truth**
2. **Migration system implementation**
3. **Database abstraction layer**
4. **Comprehensive testing**

#### Phase 4: Prevention (Week 3)

1. **CI/CD schema validation**
2. **Automated testing pipeline**
3. **Error monitoring**
4. **Documentation standards**

### 10. RISK ASSESSMENT

#### High Risk Issues
- **Complete system failure** - 100% of API endpoints broken
- **Data inconsistency** - Two competing schemas
- **Silent failures** - Frontend hides all errors

#### Medium Risk Issues
- **Authentication bypass** - Due to auth failures
- **Data loss potential** - During schema migration
- **Deployment instability** - Schema conflicts

#### Low Risk Issues
- **Performance degradation** - Due to error handling
- **User experience impact** - Silent failures

### 11. TECHNICAL RECOMMENDATIONS

#### 11.1 Schema Constants Implementation

```typescript
// api/_lib/tables.ts
export const TABLES = {
  USERS: 'astrova_users',
  CREDIT_LOG: 'astrova_credit_log',
  KNOWLEDGE_BASE: 'astrova_knowledge_base',
  ADMIN_CONFIG: 'astrova_admin_config',
  USER_SETTINGS: 'astrova_user_settings',
  CHAT_SESSIONS: 'astrova_chat_sessions',
  SAVED_CHARTS: 'astrova_saved_charts',
  ENABLED_MODELS: 'enabled_models',
} as const;
```

#### 11.2 Database Abstraction Layer

```typescript
// api/_lib/database.ts
export class Database {
  constructor(private sql: Sql) {}
  
  async getUserByFirebaseUid(firebaseUid: string) {
    return this.sql`SELECT * FROM ${TABLES.USERS} WHERE firebase_uid = ${firebaseUid}`;
  }
  
  async createAdminUser(userData: AdminUserData) {
    return this.sql`INSERT INTO ${TABLES.USERS} (...) VALUES (...)`;
  }
}
```

#### 11.3 Error Handling Improvement

```typescript
// Frontend error handling
if (response.status === 403) {
  throw new ApiError('Forbidden', 'You do not have permission to access this resource');
}
if (!response.ok) {
  throw new ApiError(response.status, `API Error: ${response.statusText}`);
}
```

### 12. CONCLUSION

**CRITICAL SYSTEM FAILURE**: Astrova is completely non-functional due to fundamental database schema conflicts. This is not a minor bug - it's a complete architectural breakdown.

**IMMEDIATE ACTION REQUIRED**: Fix the 22 table name mismatches to restore basic functionality.

**LONG-TERM STABILITY**: Requires comprehensive architectural refactoring to prevent recurrence.

**BUSINESS IMPACT**: 100% of user-facing functionality is broken. No users can authenticate, claim credits, or use any features.

This analysis represents a complete system-wide failure requiring immediate emergency intervention followed by comprehensive architectural remediation.
