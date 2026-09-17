# Linkora v3 — People, Organizations, Experiences & AI

Linkora is a digital identity and physical-world interaction platform built with Next.js, Supabase and an AI layer.

## Product architecture

```text
                         LINKORA
                           │
          ┌────────────────┼────────────────┐
          │                │                │
       PEOPLE         ORGANIZATIONS     EXPERIENCES
          │                │                │
    Digital Profile   Companies         NFC
    QR                Schools           QR
    Contact           Restaurants       Attendance
    Personal Card     Hotels            Menus
                     Events             Check-ins
                                        Analytics
                           │
                           ▼
                      LINKORA AI
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
   AI Profiles       AI Organizations    AI Experiences
   AI Networking     AI Analytics        AI Attendance
   AI Content        AI Search           AI Menus
   AI Leads          AI Insights         AI Recommendations
```

## Routes

- `/dashboard` — command center for the three pillars
- `/people` — personal identity workspace
- `/organizations` — organization workspaces
- `/organization/[id]` — organization dashboard
- `/organization/[id]/people` — people management
- `/organization/[id]/attendance` — attendance records
- `/organization/[id]/ai` — organization AI assistant
- `/experiences` — experience hub
- `/experiences/cards` — NFC/QR card manager
- `/experiences/attendance` — check-in station
- `/experiences/menus` — digital menu manager
- `/experiences/events` — event experience entry point
- `/experiences/analytics` — engagement analytics
- `/organization/[id]/cards` — organization card issuance
- `/m/[slug]` — public menu
- `/c/[cardUid]` — stable NFC/QR card resolver
- `/u/[username]` — public personal profile
- `/ai` — Linkora AI workspace
- `/admin` — platform admin overview

## AI

AI is a cross-platform layer, not a standalone chatbot. Current actions include profile building, marketing copy, public profile Q&A, analytics insights, organization Q&A and public menu Q&A.

Set `OPENAI_API_KEY` and optionally `OPENAI_MODEL` in `.env.local`.

## Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in Supabase SQL Editor.
3. Copy `.env.example` to `.env.local` and fill in Supabase credentials.
4. Add `OPENAI_API_KEY` for AI features.
5. Run `pnpm install`.
6. Run `pnpm dev`.

## NFC model

Linkora does not need to read the physical chip UID in the browser. Register a Linkora `card_uid` and write the stable URL `/c/[cardUid]` to the NFC tag. The resolver can then point the card to a profile or other experience without rewriting the tag.

## Production hardening before launch

- Restrict organization role changes to owner/admin/manager.
- Rate-limit public analytics/event endpoints and add bot protection.
- Consider a restricted public card view instead of exposing internal card relationships.
- Validate destination URLs and prevent unsafe redirects.
- Add stronger audit logging and admin CRUD.
- Add native NFC writing only if the product requires in-app tag provisioning.
