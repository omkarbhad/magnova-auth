# magnova-auth — Full Setup Guide

Unified Firebase auth for all Magnova apps (`auth.magnova.ai`).  
Routes: `/` (default) · `/astrova` · `/graphini` · `/codecity`

---

## Stack

- **Next.js 15** (App Router) on **Vercel**
- **Firebase Auth** (Google + email/password) — client SDK
- **Firebase Admin SDK** — server-side token verification
- **Neon** (PostgreSQL serverless) — shared `magnova_users` table
- **Tailwind CSS v4**

---

## 1. Firebase Project Setup

### 1a. Create Firebase project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create project → name it (e.g. `magnova-a4210`)
3. Enable Google Analytics if you want (optional)

### 1b. Enable Authentication
Firebase Console → Authentication → Get started  
Enable providers:
- **Google** (set project support email)
- **Email/Password**

### 1c. Add Authorized Domains
Firebase Console → Authentication → Settings → Authorized domains  
Add:
- `localhost` (already there)
- `auth.magnova.ai`
- your Vercel preview domain (e.g. `magnova-auth-xxx.vercel.app`) — optional for testing

### 1d. Get Firebase Client Config
Firebase Console → Project Settings → Your apps → Web app  
Copy the config object — you'll need all 6 keys for `.env.local`.

### 1e. Generate Service Account (for Admin SDK)
Firebase Console → Project Settings → Service accounts → Generate new private key  
Downloads a JSON file. You'll paste the entire JSON (minified) as `FIREBASE_SERVICE_ACCOUNT_JSON`.

---

## 2. Google Cloud Console — OAuth Setup

⚠️ This is the trickiest part. Must be done or you get `redirect_uri_mismatch`.

Go to: [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)  
Select your Firebase project → OAuth 2.0 Client IDs → Edit your web client.

### Authorized JavaScript origins — add:
```
http://localhost:3100
https://auth.magnova.ai
```

### Authorized redirect URIs — add:
```
http://localhost:3100/__/auth/handler
https://auth.magnova.ai/__/auth/handler
https://<your-firebase-project-id>.firebaseapp.com/__/auth/handler
```

### OAuth Consent Screen
APIs & Services → OAuth consent screen → Edit App:
- **App name:** `Magnova AI`
- **App logo:** upload your logo
- **Support email:** your email
- Save

---

## 3. Neon Database

### 3a. Create project
Go to [neon.tech](https://neon.tech) → New project → name it `magnova`

### 3b. Create the users table
In the Neon SQL editor, run:

```sql
CREATE TABLE IF NOT EXISTS magnova_users (
  id              SERIAL PRIMARY KEY,
  firebase_uid    TEXT UNIQUE NOT NULL,
  email           TEXT NOT NULL,
  display_name    TEXT,
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_magnova_users_firebase_uid ON magnova_users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_magnova_users_email ON magnova_users(email);
```

### 3c. Get connection string
Neon Dashboard → Connection Details → copy the `DATABASE_URL` (use the pooled connection string).

---

## 4. Environment Variables

Create `.env.local` in project root:

```env
# Firebase Client (public — safe to expose)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=auth.magnova.ai
NEXT_PUBLIC_FIREBASE_PROJECT_ID=magnova-a4210
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=magnova-a4210.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=446481370505
NEXT_PUBLIC_FIREBASE_APP_ID=1:446481370505:web:...

# Firebase Admin (server only — NEVER expose)
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}

# Neon DB
DATABASE_URL=postgresql://...
```

> ⚠️ `FIREBASE_SERVICE_ACCOUNT_JSON` = the entire service account JSON file content, minified to one line.
> Minify with: `cat service-account.json | jq -c .`

---

## 5. Local Development

```bash
pnpm install
pnpm dev          # runs on http://localhost:3100
```

Routes to test:
- `localhost:3100/` → Magnova default (indigo)
- `localhost:3100/astrova` → Astrova (amber)
- `localhost:3100/graphini` → Graphini (violet)
- `localhost:3100/codecity` → CodeCity (cyan)

---

## 6. Deploy to Vercel

### 6a. Initial deploy
```bash
vercel --prod
```
This creates the project and deploys.

### 6b. Set environment variables in Vercel
```bash
# Use printf to avoid trailing newline bugs
printf 'your-value' | vercel env add VARIABLE_NAME production

# Or set them all in Vercel Dashboard → Project → Settings → Environment Variables
```

> ⚠️ **Do NOT use `<<< "value"` or `echo` with heredoc** — adds a `\n` which shows as `%0A` in URLs and breaks Firebase auth.

### 6c. Add custom domain
Vercel Dashboard → Project `magnova-auth` → Settings → Domains → Add `auth.magnova.ai`

If the domain is assigned to another project:
- Go to that project → Settings → Domains → remove it first
- Then add to `magnova-auth`

### 6d. DNS (Cloudflare or your registrar)
Add CNAME record:
```
auth.magnova.ai  →  cname.vercel-dns.com
```

---

## 7. The `/__/auth/` Proxy (Critical)

Firebase OAuth popups open `authDomain/__/auth/handler`. For the popup to say  
**"Sign in to continue to auth.magnova.ai"** instead of `magnova-a4210.firebaseapp.com`,  
you need the `/__/auth/*` path proxied to Firebase.

This is already in `next.config.ts`:

```ts
async rewrites() {
  return [
    {
      source: '/__/auth/:path*',
      destination: 'https://magnova-a4210.firebaseapp.com/__/auth/:path*',
    },
  ];
},
```

**How it works:** When Google OAuth redirects to `auth.magnova.ai/__/auth/handler`,  
Next.js on Vercel proxies it to Firebase → auth completes → user lands back on your app.

---

## 8. How Auth Works (End to End)

```
User clicks "Continue with Google"
  → Firebase client opens popup to authDomain/__/auth/handler
  → (Vercel proxies this to Firebase's real handler)
  → Google OAuth completes
  → Firebase returns ID token to your app
  → AuthPage.tsx calls POST /api/auth/session with the token
  → Server verifies token with Firebase Admin SDK
  → Server upserts user in Neon (magnova_users table)
  → Server sets httpOnly cookie: magnova_session = firebaseUid
    (domain: .magnova.ai — works across all subdomains)
  → User redirected to app (astrova.magnova.ai, graphini.magnova.ai, etc.)

When app needs to verify auth:
  → App calls GET /api/auth/session
  → Server reads magnova_session cookie
  → Looks up user in Neon
  → Returns user object
```

---

## 9. Per-App Redirect

Each app can redirect to itself after auth:
```
https://auth.magnova.ai/astrova?redirect=https://astrova.magnova.ai/dashboard
```

Or use the default redirect configured in `AuthPage.tsx` → `APP_CONFIGS`.

---

## 10. Sign Out

```ts
// In any Magnova app
await fetch('https://auth.magnova.ai/api/auth/signout', { method: 'POST', credentials: 'include' });
```

Clears the `magnova_session` cookie across all `.magnova.ai` subdomains.

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `redirect_uri_mismatch` | Auth domain not in Google OAuth client | Add to Google Cloud Console → Credentials → OAuth client → Authorized redirect URIs |
| `Illegal url for new iframe - ...%0A...` | Trailing newline in `authDomain` env var | Use `printf 'value'` not `echo` when setting Vercel env vars |
| `404` on OAuth popup | `authDomain` set to custom domain but `/__/auth/` proxy missing or domain not live | Ensure Next.js rewrite for `/__/auth/*` is in `next.config.ts` |
| CSS not loading | Tailwind v4 needs `@source` directive | Add `@source "../../**/*.{ts,tsx}"` to `globals.css` |
| `FIREBASE_SERVICE_ACCOUNT_JSON is not defined` | Env var not set on server | Add to Vercel env vars (server/production only) |

---

*Last updated: 2026-03-05 · Built by Omkar + Zalesis ⚡*
