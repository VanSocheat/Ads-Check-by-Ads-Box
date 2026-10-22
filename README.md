# Ads Check by Ads Box (starter)

## 1. Create the Meta app
1. https://developers.facebook.com/apps -> Create App -> type **Business**.
2. Add product **Facebook Login for Business** (or Facebook Login).
3. Settings -> Basic: copy **App ID** and **App Secret**.
4. Facebook Login -> Settings -> Valid OAuth Redirect URIs: add
   `http://localhost:3000/api/auth/callback` (and your real domain later).
5. In development mode only people with a role on the app (Roles tab) can log in.

## 2. Run
    cp .env.example .env.local   # fill in the 3 values
    npm install
    npm run dev                  # http://localhost:3000

## 3. Go live
- Deploy (Vercel / VPS), set the same env vars, set APP_URL to your domain (HTTPS).
- For OTHER people to connect: App Review for `ads_read` + `business_management`, and Business Verification.

## Next steps
- Store tokens encrypted in Postgres instead of the cookie.
- Cron sync every 15-30 min + Telegram/email alerts (threshold, disabled).
- Multi-user login, per-user accounts.
