# Tech Stack

## Stack Summary

Uncognito uses a TypeScript repo split into `frontend/` and `backend/`. The frontend contains the public portal and browser extension. The backend contains the API plus focused services for contracts, storage, AI, scheduling, and social sharing.

| Layer | Choice | Why |
| --- | --- | --- |
| Language | TypeScript | Shared types across frontend, extension, API, and backend services. |
| Package manager | npm workspaces | Root scripts use the workspace support in `package.json`; `pnpm-workspace.yaml` is compatibility metadata only and is not required to run tests. |
| Web frontend | Next.js | Server-rendered public pages and dynamic Open Graph metadata. |
| Extension frontend | Chrome Manifest V3 | Required platform for alarms, popup UI, storage, and visible-tab capture. |
| Backend API | TypeScript HTTP API | Keeps upload, roast, hide/delete, and share endpoints separate from frontend code. |
| Hosting | Vercel or equivalent Node/serverless host | Low-friction public URLs for hackathon demos. |
| Database | Supabase Postgres | Hosted Postgres for roast metadata, status transitions, and public read policies. |
| Schema migrations | Supabase SQL migrations | Direct SQL keeps schema, enums, indexes, triggers, and policies explicit. |
| Image storage | Supabase Storage | Public bucket URLs satisfy Open Graph crawler requirements. |
| AI | OpenAI vision-capable model via env config | The roast generator needs screenshot understanding and controlled text output. |
| Social sharing | Manual link and LinkedIn share-link demo flow first | Manual share is reliable for demos. |
| Unit testing | Node built-in test runner | Current service and integration tests run with `node --test` without extra test dependencies. |
| E2E testing | Playwright | Browser-level verification for portal flows and share metadata. |
| Code quality | ESLint, Prettier, TypeScript strict mode | Baseline consistency without heavy process. |

## Version Policy

Use current stable releases when implementation begins. Avoid hard-pinning product decisions in docs unless a dependency requires it. Runtime versions should be recorded in package manifests and lockfiles once dependencies are installed.

## Frontend Stack

### `frontend/web`

- Next.js App Router.
- Wall of Shame gallery at `/`.
- Server-rendered `/roast/[id]` pages with Open Graph metadata.
- Admin or owner controls that call backend endpoints protected by `ADMIN_TOKEN`.
- No provider SDKs in frontend code.

### `frontend/extension`

- Manifest V3 extension.
- TypeScript source.
- React or lightweight DOM popup UI.
- `chrome.storage.local` for settings.
- `chrome.alarms` for randomized capture scheduling.
- `chrome.tabs.captureVisibleTab` for screenshot capture.

## Backend Stack

### `backend/api`

- TypeScript API surface for upload, roast reads, hide/delete, and optional share triggers.
- Routes mirror the PRD contracts:
  - `POST /upload`
  - `GET /roasts`
  - `GET /roasts/:id`
  - `PATCH /roasts/:id`
  - `DELETE /roasts/:id`
  - `POST /share/:id` if social automation is enabled.
- Request validation uses schemas from `backend/services/shared`.
- API orchestration delegates to backend services instead of embedding provider logic in route files.

## Backend Services

### `backend/services/shared`

Owns shared contracts, request/response types, status enums, validation schemas, and constants used across frontend and backend.

### `backend/services/random-trigger`

Owns Poisson/exponential interval generation, intensity presets, clamping, and deterministic tests.

### `backend/services/storage`

Owns Supabase Postgres schema, SQL migrations, Supabase Storage adapters, object cleanup, and public-safe ID generation.

### `backend/services/ai`

Owns the roast prompt, AI provider adapter, caption validation, theme metadata, and fallback captions.

### `backend/services/privacy`

Placeholder for future redaction, caption safety helpers, consent copy helpers, and privacy-focused fixtures. It is not an active MVP dependency.

### `backend/services/social`

Owns copy/share helpers and share status normalization.

## Environment Variables

```text
SUPABASE_URL=https://dgsqalakuycjxdnsdrnl.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_swa3MqwbsGNDQpYaiG9wGw_urwihpaa
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=roast-images
OPENAI_API_KEY=
OPENAI_VISION_MODEL=
PUBLIC_APP_URL=
ADMIN_TOKEN=
```

`SUPABASE_SERVICE_ROLE_KEY` is backend-only and must never be exposed to `frontend/`. Local development may use mock image storage and fallback captions.

## Implementation Notes

- Keep provider integrations behind backend service adapters so local demo mode can work without every external service.
- Put request and response contracts in `backend/services/shared` before implementing dependent API routes or extension calls.
- Do not store raw base64 screenshots after successful image upload.
- Treat AI output as untrusted and validate it before publishing.
- Make manual capture, Screenshot + LinkedIn Link, and manual sharing work before randomized scheduling or automated posting.
