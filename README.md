# Suno Proposals

Internal tool for creating, managing, and sharing campaign test proposals between the Neonblue and Suno teams.

**Production URL:** `https://sunoproposals.neonbluesuccess.com`  
**Local:** `http://localhost:3000`

---

## Stack

| Layer | Service |
|---|---|
| Framework | Next.js 16 (App Router) |
| Auth | NextAuth.js v5 (Google OAuth) |
| Database | Neon (Postgres, serverless) |
| Hosting | Vercel |
| DNS | Managed via Vercel (subdomain of `neonbluesuccess.com`) |

---

## Auth — Google OAuth (GCP)

**Project:** `neonblue-proposals` (or whichever GCP project was used)  
**Console:** [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)

- **OAuth Type:** External (allows both `@neonblue.ai` and `@suno.com` accounts)
- **Status:** Testing mode — test users must be explicitly added in GCP console
- **Allowed domains (enforced in code):** `neonblue.ai`, `suno.com`

**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/callback/google
https://sunoproposals.neonbluesuccess.com/api/auth/callback/google
```

> If the domain changes, add the new redirect URI in GCP → OAuth 2.0 Client → Edit.

---

## Database — Neon

**Console:** [console.neon.tech](https://console.neon.tech)  
**Project:** `suno-proposals`  
**Region:** `us-east-2` (AWS)  
**Database:** `neondb`  
**Connection:** Pooled (serverless-compatible)

The `proposals` table is created automatically on first run via `lib/db.ts → initDb()`. No migrations needed.

**Schema summary:**
- `id`, `slug`, `test_name`, `created_at`, `updated_at`, `created_by`
- Sections: Flow Details, Message Spec, Testing Goals, Personalization Strategy, Results & Learning, Creative Strategy

---

## Environment Variables

Set these in Vercel project settings → Environment Variables (and locally in `.env.local`):

| Variable | Description |
|---|---|
| `AUTH_GOOGLE_ID` | Google OAuth Client ID (from GCP) |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret (from GCP) |
| `AUTH_SECRET` | Random secret for JWT signing (`openssl rand -base64 32`) |
| `DATABASE_URL` | Neon connection string (pooled, with `sslmode=require`) |
| `NEXTAUTH_URL` | Full base URL (`https://sunoproposals.neonbluesuccess.com` in prod) |

---

## Vercel Hosting

**Project:** `suno-proposals` (separate from the `neonblue - customer success` static site)  
**Custom domain:** `sunoproposals.neonbluesuccess.com`  
**DNS record:** `CNAME sunoproposals → cname.vercel-dns.com`

> The parent domain `neonbluesuccess.com` is a separate Vercel project (static HTML). Both coexist under the same root domain.

---

## Local Development

```bash
# Install dependencies
npm install

# Add environment variables
cp .env.local.example .env.local  # then fill in values

# Run dev server
npm run dev
# → http://localhost:3000
```

---

## Deployment

Pushes to `main` auto-deploy via Vercel. No build step needed — Vercel handles it.

```bash
git add -A
git commit -m "your message"
git push origin main
```

---

## Proposal URL Structure

| Route | Description |
|---|---|
| `/` | List of all proposals |
| `/new` | Create a new proposal |
| `/[slug]` | View and edit a proposal |

Slugs are auto-generated from the **Test Name** field on creation.

---

## Adding New Team Members (Auth)

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → OAuth consent screen → Test users
2. Add their Google account email
3. They can now log in at `sunoproposals.neonbluesuccess.com` with their `@neonblue.ai` or `@suno.com` account

> Only needed while the app is in GCP "Testing" mode. If published, any `@neonblue.ai` or `@suno.com` account can log in without being pre-added.
