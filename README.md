# CapRateAlpha

MVP scaffold for owner-led retail vacancy marketing.

## Stack

- Next.js App Router
- TypeScript
- Supabase-friendly environment setup

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Copy env values:

```bash
cp .env.example .env.local
```

3. Start the dev server:

```bash
npm run dev
```

4. Apply the initial schema in Supabase:

Use [supabase/schema.sql](./supabase/schema.sql) as the MVP bootstrap schema.

5. Optional: configure lead notification email delivery:

- `RESEND_API_KEY`
- `NOTIFICATIONS_FROM_EMAIL`

6. Optional: configure storage-backed photo uploads:

- `SUPABASE_STORAGE_BUCKET` defaults to `assets`

7. Optional: configure AI listing copy generation:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`

8. Check live QA prerequisites:

```bash
npm run qa:setup-check
```

## Current scaffold

- marketing homepage
- Supabase-ready signup entry point
- protected Day 1 onboarding shell
- publish readiness screen
- publish success screen
- public vacancy landing page route
- workspace bootstrap that can persist to Supabase when env values are configured
- AI listing copy generation with deterministic fallback
- LoopNet export workflow with photo upload hook

## Notes

- internal routes now assume authenticated access
- workspace bootstrap persists when Supabase env values and schema are configured
- install dependencies before running the app

## Key docs

- [MVP scope](./docs/mvp-scope.md)
- [Auth ADR](./docs/adr-mvp-auth-and-workspace-model.md)
- [Landing page ADR](./docs/adr-mvp-landing-page-publishing-and-domain.md)
- [Flyer rendering ADR](./docs/adr-mvp-flyer-rendering-pipeline.md)
