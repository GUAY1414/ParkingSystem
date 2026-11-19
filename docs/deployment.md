# Deployment Guide

## Frontend — Vercel

1. Import the GitHub repository in Vercel.
2. Set the root directory to `frontend`.
3. Configure:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api`
4. Deploy.

## Backend — Render

1. Create a Render Web Service.
2. Set the root directory to `backend`.
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Configure all required environment variables.
6. Set `NODE_ENV=production`.
7. Set `FRONTEND_URL` to the Vercel URL.

## Database — Supabase

Apply migrations in numeric order.

Verify RLS before exposing public APIs.

## Production Requirements

- Use HTTPS.
- Restrict CORS to the Vercel domain.
- Do not commit service-role keys or provider secrets.
- Configure Resend with a verified sender.
- Configure PayMongo webhook URL only after provider account approval.
- Avoid real personal or financial data on free-tier demonstrations.

## Free-Tier Limits

- Render services may sleep when inactive.
- Supabase database and API usage are limited by plan.
- Vercel bandwidth and builds are limited by plan.
- Resend and PayMongo impose account and usage restrictions.
