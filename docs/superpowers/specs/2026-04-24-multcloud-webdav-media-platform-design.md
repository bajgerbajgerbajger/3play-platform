---
title: "3Play: MultCloud WebDAV storage + Admin hardening + Full upload/playback (Web + Mobile)"
date: "2026-04-24"
status: "draft"
---

# Goals

- Make the platform production-ready for uploading and managing movies and series across Web (Next.js) and Mobile (Expo).
- Use MultCloud via WebDAV as the source of truth for storing uploaded media assets.
- Provide an admin account bootstrapped from environment variables (no credentials committed).
- Ensure admin routes and admin APIs are protected server-side.
- Support public playback (no login required) per user request.

# Non-Goals

- Billing/Stripe subscription enforcement.
- DRM or advanced anti-piracy measures.
- Multi-tenant admin (multiple orgs/providers).

# Current State (Summary)

- Next.js app provides movies/series browse, player, auth, and an admin area.
- Prisma (SQLite) schema already supports movies, series, seasons, and episodes.
- Upload route exists at `/api/upload` but currently writes to `public/uploads`.
- Admin “content edit” routes are linked but missing; some admin endpoints are inconsistently protected.

# High-Level Architecture

- **Storage**: MultCloud WebDAV (credentials via environment variables).
- **Backend**: Next.js App Router route handlers.
- **Auth**: NextAuth credentials for web admin. Mobile uses JWT login route.
- **Playback**: Public playback through app endpoints. Media will be served via a Next.js API proxy that supports HTTP Range.

# Key Requirements

## 1) Admin bootstrap

- Environment variables:
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`
- Seed behavior:
  - Create admin if missing; update password if user exists and role is ADMIN (or set role to ADMIN for the seeded email).
  - Store password hashed with bcrypt.

## 2) Admin access control

- Add a proper Next.js middleware file at repo root (`/middleware.ts`) to protect:
  - `/admin/*` → require auth and `role === 'ADMIN'`
  - `/profile/*`, `/settings/*`, `/watchlist/*` → require auth
- Ensure every `/api/admin/*` route enforces admin server-side with a shared helper.

## 3) Upload pipeline (MultCloud WebDAV)

- Upload types:
  - Images: poster/backdrop
  - Videos: movie video or episode video
- Upload mechanism:
  - Chunked upload supported (keep existing admin UI behavior).
  - Server assembles chunks to a temp file, then uploads the finalized file to WebDAV.
  - After successful PUT, delete temp artifacts.
- Metadata extraction:
  - Keep ffprobe duration + ffmpeg thumbnail extraction, but store thumbnail in WebDAV (not local public dir).

### WebDAV config

- Environment variables:
  - `WEBDAV_BASE_URL` (MultCloud WebDAV endpoint root)
  - `WEBDAV_USERNAME`
  - `WEBDAV_PASSWORD`
- Remote paths convention:
  - `/3play/uploads/posters/<uuid>.<ext>`
  - `/3play/uploads/backdrops/<uuid>.<ext>`
  - `/3play/uploads/videos/<uuid>.<ext>`
  - `/3play/uploads/thumbs/<uuid>.jpg`

## 4) Playback (public)

- Provide a media proxy endpoint:
  - `GET /api/media/[...path]`
  - Reads from WebDAV and streams to the client
  - Supports `Range` requests for seeking
- Public access:
  - No auth required to fetch `/api/media/*`
- Content URLs stored in DB:
  - Store `videoUrl`, `posterUrl`, etc. as app URLs pointing to the proxy (not raw WebDAV URLs) so the client never needs WebDAV credentials.

## 5) Series management

- Admin UI supports:
  - Create series (existing)
  - Add/edit/delete seasons
  - Add/edit/delete episodes under a season
  - Upload episode video via the same upload endpoint
- Backend routes:
  - Extend `/api/admin/content` or add dedicated routes for seasons/episodes to manage CRUD.

## 6) Fonts/UI fixes

- Use `next/font` to define `--font-sans` to match `globals.css` tokens.
- Ensure consistent font usage across web pages and admin pages.

# API Surface (Proposed)

- `POST /api/upload`
  - Admin-only
  - Accepts multipart for single file and chunk uploads, plus JSON finalize
  - Returns `{ url, thumbnailUrl, duration }` where `url` points to `/api/media/...` proxy
- `GET /api/media/[...path]`
  - Public
  - Streams content from WebDAV with Range support
- Admin CRUD (admin-only):
  - `POST/DELETE /api/admin/content`
  - `POST/PUT/DELETE /api/admin/seasons`
  - `POST/PUT/DELETE /api/admin/episodes`

# Security Notes

- No secrets or credentials committed.
- WebDAV credentials only used server-side.
- Centralized authorization to avoid inconsistent route protection.

# Verification

- Web:
  - `npm run lint`
  - `npm run build`
  - Manual smoke: admin login, upload a movie, play it, create series season+episode and play episode.
- Mobile:
  - Validate login + browse + playback against the updated endpoints.

