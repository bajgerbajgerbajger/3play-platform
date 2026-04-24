# 3Play MultCloud WebDAV Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing Web + Mobile 3Play app production-ready with admin hardening, MultCloud WebDAV-backed uploads, public streaming via a server proxy with Range support, and complete admin management for movies + series (seasons/episodes).

**Architecture:** Store uploaded files in MultCloud WebDAV (private). Persist DB URLs as app-owned proxy URLs (`/api/media/...`) so clients never see WebDAV credentials. Enforce admin protection with server middleware and centralized API auth checks.

**Tech Stack:** Next.js (App Router), TypeScript, Prisma (SQLite), NextAuth (web), JWT (mobile), Tailwind, ffmpeg/ffprobe.

---

## File Map (Planned Changes)

**Create**
- `middleware.ts` (Next.js middleware for route protection)
- `src/lib/webdav.ts` (WebDAV client helpers)
- `src/lib/adminAuth.ts` (centralized `requireAdmin` helper for route handlers)
- `src/app/api/media/[...path]/route.ts` (public streaming proxy with Range support)
- `src/app/api/admin/seasons/route.ts` (admin CRUD for seasons)
- `src/app/api/admin/episodes/route.ts` (admin CRUD for episodes)
- `src/app/admin/content/edit/movie/[id]/page.tsx` (movie edit UI)
- `src/app/admin/content/edit/series/[id]/page.tsx` (series edit UI, link to seasons/episodes)
- `src/app/admin/series/[id]/seasons/page.tsx` (season manager)
- `src/app/admin/series/[id]/seasons/[seasonId]/episodes/page.tsx` (episode manager + upload)
- `scripts/selftest/media-range.test.ts` (Range proxy self-test)
- `scripts/selftest/webdav-put-get.test.ts` (WebDAV put/get self-test)

**Modify**
- `prisma/seed.ts` (admin bootstrap from `ADMIN_EMAIL`/`ADMIN_PASSWORD`)
- `src/app/api/upload/route.ts` (upload to WebDAV and return proxy URLs)
- `src/app/api/admin/genres/route.ts` (add admin auth)
- `src/app/admin/content/ContentActions.tsx` (fix broken edit/rename/delete code paths)
- `src/app/admin/content/new/page.tsx` (support WebDAV-backed URLs and episode upload UX reuse)
- `src/app/layout.tsx` (font variable wiring)
- `src/app/globals.css` (only if needed to match chosen font var)
- `mobile/src/api/client.ts` (if playback URL base changes)

---

### Task 1: Add admin bootstrap via env vars (remove hardcoded credentials)

**Files:**
- Modify: `prisma/seed.ts`
- Create: `scripts/selftest/admin-seed.test.ts`

- [ ] **Step 1: Write failing self-test**

Create `scripts/selftest/admin-seed.test.ts`:

```ts
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';

async function main() {
  assert.ok(process.env.ADMIN_EMAIL, 'ADMIN_EMAIL missing');
  assert.ok(process.env.ADMIN_PASSWORD, 'ADMIN_PASSWORD missing');

  const prisma = new PrismaClient();

  const user = await prisma.user.findUnique({ where: { email: process.env.ADMIN_EMAIL } });
  assert.ok(user, 'Admin user not found');
  assert.equal(user?.role, 'ADMIN', 'Admin role not set');

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 2: Run self-test to confirm it fails**

Run:

```bash
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=change-me npm run db:seed && tsx scripts/selftest/admin-seed.test.ts
```

Expected: FAIL because seed uses hardcoded `admin@3play.com` and doesn’t use `ADMIN_EMAIL`.

- [ ] **Step 3: Update seed to use env and never print password**

Update `prisma/seed.ts` to:
- read `ADMIN_EMAIL`/`ADMIN_PASSWORD`
- throw if missing
- hash password
- upsert user by `ADMIN_EMAIL`
- set `role: 'ADMIN'` on create and update
- update password hash on update
- print only the admin email (not password)

- [ ] **Step 4: Run seed + self-test**

Run:

```bash
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=change-me npm run db:seed && tsx scripts/selftest/admin-seed.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add prisma/seed.ts scripts/selftest/admin-seed.test.ts
git commit -m "feat(auth): bootstrap admin user from env in seed"
```

---

### Task 2: Make middleware actually active for server-side admin protection

**Files:**
- Create: `middleware.ts`
- Modify: `src/proxy.ts` (optional: delete or keep unused, decide during implementation)

- [ ] **Step 1: Write failing behavior check (manual)**

Expectation: visiting `/admin` without admin session should redirect to `/`.

- [ ] **Step 2: Implement `middleware.ts` based on existing logic**

Create `middleware.ts` at repo root:
- Use `withAuth` from `next-auth/middleware`
- For `/admin/*` require `token.role === 'ADMIN'`
- For `/profile|/settings|/watchlist` require token
- Ensure `/api/media/*` remains public (exclude from matcher)

- [ ] **Step 3: Verify behavior**

Run:

```bash
npm run dev
```

Manual:
- Open `/admin` in browser without login → redirected to `/`
- Login as admin → `/admin` loads

- [ ] **Step 4: Commit**

```bash
git add middleware.ts src/proxy.ts
git commit -m "fix(auth): enable middleware route protection"
```

---

### Task 3: Centralize admin-only checks for route handlers

**Files:**
- Create: `src/lib/adminAuth.ts`
- Modify: `src/app/api/admin/genres/route.ts`

- [ ] **Step 1: Write failing self-test for unauthorized admin route**

Create `scripts/selftest/admin-guard.test.ts`:

```ts
import assert from 'node:assert/strict';

async function main() {
  const res = await fetch('http://localhost:3000/api/admin/genres', { method: 'GET' });
  assert.equal(res.status, 401, 'Expected 401 for unauthenticated access');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 2: Run to confirm it fails**

Run with dev server already running:

```bash
tsx scripts/selftest/admin-guard.test.ts
```

Expected: FAIL because `/api/admin/genres` currently returns 200.

- [ ] **Step 3: Implement `requireAdminSession()` helper**

Create `src/lib/adminAuth.ts` exporting:
- `getAdminSession()` returning session or null
- `assertAdmin()` returning `NextResponse` 401/403 as needed, or `null` for success

- [ ] **Step 4: Apply to `/api/admin/genres`**

Update `src/app/api/admin/genres/route.ts` to return 401 if not admin.

- [ ] **Step 5: Re-run self-test**

Expected: PASS (401).

- [ ] **Step 6: Commit**

```bash
git add src/lib/adminAuth.ts src/app/api/admin/genres/route.ts scripts/selftest/admin-guard.test.ts
git commit -m "fix(api): enforce admin auth consistently for admin endpoints"
```

---

### Task 4: Add WebDAV client module (PUT/GET/HEAD) using server-side fetch

**Files:**
- Create: `src/lib/webdav.ts`
- Create: `scripts/selftest/webdav-put-get.test.ts`

- [ ] **Step 1: Write failing WebDAV self-test**

Create `scripts/selftest/webdav-put-get.test.ts`:

```ts
import assert from 'node:assert/strict';

async function main() {
  assert.ok(process.env.WEBDAV_BASE_URL, 'WEBDAV_BASE_URL missing');
  assert.ok(process.env.WEBDAV_USERNAME, 'WEBDAV_USERNAME missing');
  assert.ok(process.env.WEBDAV_PASSWORD, 'WEBDAV_PASSWORD missing');

  const base = process.env.WEBDAV_BASE_URL.replace(/\/+$/, '');
  const target = `${base}/3play/selftest/hello.txt`;
  const auth = Buffer.from(`${process.env.WEBDAV_USERNAME}:${process.env.WEBDAV_PASSWORD}`).toString('base64');

  const put = await fetch(target, {
    method: 'PUT',
    headers: { Authorization: `Basic ${auth}` },
    body: 'hello',
  });
  assert.ok(put.status === 200 || put.status === 201 || put.status === 204, `PUT failed: ${put.status}`);

  const get = await fetch(target, { headers: { Authorization: `Basic ${auth}` } });
  assert.equal(get.status, 200);
  assert.equal(await get.text(), 'hello');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 2: Run self-test**

Run:

```bash
WEBDAV_BASE_URL="https://<your-webdav-host>/dav" WEBDAV_USERNAME="..." WEBDAV_PASSWORD="..." tsx scripts/selftest/webdav-put-get.test.ts
```

Expected: likely FAIL until env values are correct.

- [ ] **Step 3: Implement `src/lib/webdav.ts`**

Implement:
- `webdavUrl(remotePath: string): string`
- `webdavAuthHeader(): string`
- `webdavPutBuffer(remotePath: string, buf: Buffer, contentType?: string)`
- `webdavGet(remotePath: string, range?: string)`
- `webdavHead(remotePath: string)`

- [ ] **Step 4: Re-run self-test (using module, not inline fetch)**

Update self-test to import helpers from `src/lib/webdav.ts` and verify PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/webdav.ts scripts/selftest/webdav-put-get.test.ts
git commit -m "feat(storage): add WebDAV client helpers"
```

---

### Task 5: Public streaming proxy with Range support

**Files:**
- Create: `src/app/api/media/[...path]/route.ts`
- Create: `scripts/selftest/media-range.test.ts`

- [ ] **Step 1: Write failing Range test**

Create `scripts/selftest/media-range.test.ts`:

```ts
import assert from 'node:assert/strict';

async function main() {
  assert.ok(process.env.MEDIA_TEST_PATH, 'MEDIA_TEST_PATH missing (example: 3play/uploads/videos/sample.mp4)');

  const url = `http://localhost:3000/api/media/${process.env.MEDIA_TEST_PATH}`;
  const res = await fetch(url, { headers: { Range: 'bytes=0-1023' } });
  assert.equal(res.status, 206, `Expected 206, got ${res.status}`);

  const body = await res.arrayBuffer();
  assert.equal(body.byteLength, 1024);

  const cr = res.headers.get('content-range');
  assert.ok(cr && cr.startsWith('bytes '), 'Missing Content-Range');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 2: Implement the proxy route**

Create `src/app/api/media/[...path]/route.ts`:
- Extract the requested path segments and join as a WebDAV remote path
- Forward `Range` header if present
- Return a `NextResponse` with:
  - same status from WebDAV (200 or 206)
  - `Content-Type`, `Content-Length`, `Content-Range`, `Accept-Ranges` passthrough as available
  - body streamed from WebDAV response

- [ ] **Step 3: Run dev server + Range test**

Run:

```bash
npm run dev
```

In another shell:

```bash
MEDIA_TEST_PATH="3play/selftest/hello.txt" tsx scripts/selftest/media-range.test.ts
```

Expected: For a text file Range may work differently depending on WebDAV; use a real media file if needed. Goal is 206 + correct bytes count.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/media/[...path]/route.ts scripts/selftest/media-range.test.ts
git commit -m "feat(media): add public WebDAV streaming proxy with Range support"
```

---

### Task 6: Migrate `/api/upload` from local `public/uploads` to WebDAV + proxy URLs

**Files:**
- Modify: `src/app/api/upload/route.ts`

- [ ] **Step 1: Add a failing smoke test (manual)**

Manual expectation:
- Admin can upload poster/video from `/admin/content/new`
- API returns `url` that starts with `/api/media/`
- Playback works in `/watch/*` player

- [ ] **Step 2: Implement WebDAV-backed upload**

In `src/app/api/upload/route.ts`:
- Keep the same request contract (multipart for file/chunks + JSON finalize)
- For images: upload buffers directly to WebDAV (poster/backdrop folder)
- For videos:
  - write to a temp file (already done for chunks; for single-file do the same)
  - run ffprobe + ffmpeg thumbnail extraction from the temp file
  - upload the video file to WebDAV
  - upload thumbnail to WebDAV
  - delete temp file/dir
- Return:
  - `url`: `/api/media/<remotePath>`
  - `thumbnailUrl`: `/api/media/<thumbRemotePath>`
  - `duration`: minutes

- [ ] **Step 3: Verify admin upload flow**

Manual:
- Login as admin
- Upload a movie video
- Ensure movie plays via `/api/media/...`

- [ ] **Step 4: Commit**

```bash
git add src/app/api/upload/route.ts
git commit -m "feat(upload): store uploads in WebDAV and return media proxy URLs"
```

---

### Task 7: Fix admin content actions and implement missing edit pages

**Files:**
- Modify: `src/app/admin/content/ContentActions.tsx`
- Create: `src/app/admin/content/edit/movie/[id]/page.tsx`
- Create: `src/app/admin/content/edit/series/[id]/page.tsx`

- [ ] **Step 1: Fix `ContentActions` broken logic**

Changes:
- Remove duplicated nested `try { try { ... } }`
- Make Edit route match the created pages:
  - `/admin/content/edit/movie/<id>`
  - `/admin/content/edit/series/<id>`
- Implement rename via admin API (either extend `/api/admin/content` with PATCH, or add a dedicated route)

- [ ] **Step 2: Implement movie edit page**

Provide:
- Editable fields: title, slug (validate unique), description, year, duration override, isPremium, isPublished
- Poster/backdrop re-upload optional
- Video re-upload optional

- [ ] **Step 3: Implement series edit page**

Provide:
- Editable series fields
- Link/button to manage seasons/episodes

- [ ] **Step 4: Manual verify**

- Edit a movie and confirm changes reflect in browse page
- Edit a series and confirm changes reflect

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/content/ContentActions.tsx src/app/admin/content/edit
git commit -m "feat(admin): add content edit pages and fix admin actions"
```

---

### Task 8: Add seasons and episodes CRUD (API + Admin UI)

**Files:**
- Create: `src/app/api/admin/seasons/route.ts`
- Create: `src/app/api/admin/episodes/route.ts`
- Create: `src/app/admin/series/[id]/seasons/page.tsx`
- Create: `src/app/admin/series/[id]/seasons/[seasonId]/episodes/page.tsx`

- [ ] **Step 1: Implement admin-only seasons route**

Supported operations:
- `POST` create season `{ seriesId, seasonNumber, title?, description?, posterUrl?, releaseDate? }`
- `PUT` update season `{ id, ...fields }`
- `DELETE` delete season `?id=...`

Enforce admin via `src/lib/adminAuth.ts`.

- [ ] **Step 2: Implement admin-only episodes route**

Supported operations:
- `POST` create episode `{ seasonId, episodeNumber, title, description, duration, releaseDate?, thumbnailUrl?, videoUrl? }`
- `PUT` update episode `{ id, ...fields }`
- `DELETE` delete episode `?id=...`

- [ ] **Step 3: Build seasons admin UI**

`/admin/series/[id]/seasons`:
- List seasons
- Add/edit/delete season
- Link to episode manager

- [ ] **Step 4: Build episodes admin UI**

`/admin/series/[id]/seasons/[seasonId]/episodes`:
- List episodes
- Add/edit/delete episode
- Upload episode video via `/api/upload` and save `videoUrl` + `thumbnailUrl`

- [ ] **Step 5: Manual verify**

- Create season + episode, upload episode video, ensure episode playback works from series page/player.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/admin/seasons/route.ts src/app/api/admin/episodes/route.ts src/app/admin/series
git commit -m "feat(admin): seasons and episodes management with upload"
```

---

### Task 9: Fix fonts and any obvious UI regressions

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css` (only if necessary)

- [ ] **Step 1: Implement `next/font` and wire `--font-sans`**

Update `src/app/layout.tsx` to load a font (e.g. Inter) with `variable: '--font-sans'` and add the variable to `<html className="...">`.

- [ ] **Step 2: Manual verify**

- Check main pages and admin pages for consistent typography and no missing font fallback.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "fix(ui): wire font-sans via next/font"
```

---

### Task 10: End-to-end verification (web + mobile) and push

**Files:**
- N/A (verification only, unless fixes needed)

- [ ] **Step 1: Lint and build web**

```bash
npm run lint
npm run build
```

Expected: exit code 0.

- [ ] **Step 2: Sanity check key flows**

Manual:
- Admin login works
- Upload movie video (WebDAV), play it
- Create series season+episode, upload episode video, play it

- [ ] **Step 3: Commit any remaining fixes**

```bash
git status
git add -A
git commit -m "chore: stabilize webdav upload and admin flows"
```

- [ ] **Step 4: Push to GitHub**

```bash
git push
```

