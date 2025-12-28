# Netlify Deployment Guide

1. **Setup**:
   - Install dependencies: `pnpm install`.
   - Ensure `.env` vars are set for local dev (Supabase, P24 Sandbox).

2. **Netlify Config**:
   - Import project in Netlify Dashboard.
   - Build settings are auto-detected via `netlify.toml`.
   - **Environment Variables**:
     - `NODE_VERSION`: `20`
     - `VITE_SUPABASE_URL`: [Your URL]
     - `VITE_SUPABASE_ANON_KEY`: [Your Key]
     - `SUPABASE_SERVICE_ROLE_KEY`: [Secret Key for Functions]
     - `P24_MERCHANT_ID`, `P24_POS_ID`, `P24_API_KEY`, `P24_CRC`
     - `P24_ENV`: `production` (or `sandbox`)
     - `APP_ORIGIN`: `https://your-app.netlify.app`

3. **Security**:
   - Headers are configured in `netlify.toml` (CSP, HSTS).
   - Functions are secured via Service Role logic.

4. **Troubleshooting**:
   - If white screen: check Console for CSP blocks.
   - If 500 error on checkout: Check Netlify Function logs for P24 auth errors.
