# Tech Stack

## Stack Summary

Uncognito uses a JavaScript monorepo split into `frontend/` and `backend/`. The frontend contains the public portal (Next.js App Router, including API routes) and browser extension. The backend contains focused service packages for contracts, storage, AI, scheduling, and social sharing.

| Layer | Choice | Why |
| --- | --- | --- |
| Language | JavaScript (ESM) | Shared types via JSDoc across frontend, extension, and backend services. |
| Package manager | npm workspaces | Root scripts use the workspace support in `package.json`. |
| Web frontend + API | Next.js App Router | Server-rendered pages with dynamic OG metadata; API routes co-located in `app/api/`. |
| Extension frontend | Chrome Manifest V3 | Required platform for alarms, popup UI, storage, and visible-tab capture. |
| Hosting | Vercel | Low-friction public URLs for hackathon demos; Next.js native deployment. |
| Database | Supabase Postgres | Hosted Postgres for roast metadata, status transitions, and public read policies. |
| Schema migrations | Supabase SQL migrations | Direct SQL keeps schema, enums, indexes, triggers, and policies explicit. |
| Image storage | Supabase Storage | Public bucket URLs satisfy Open Graph crawler requirements. |
| AI | OpenAI vision-capable model | Uses `/v1/responses` API with JSON structured output for roast generation. |
| API deps | `@supabase/supabase-js`, `openai` | Provider SDKs used only inside backend service packages. |
| Social sharing | Manual link + LinkedIn share-link demo flow | `@uncognito/social` generates share URLs and manages share status; demo returns `linkedInShareUrl` in upload response. |
| Unit testing | Node built-in test runner | Service and integration tests run with `node --test`; no extra test dependencies. |
| E2E testing | Playwright | Browser-level verification for portal flows and share metadata. |
| Code quality | ESLint, Prettier | Baseline consistency without heavy process. |

## Version Policy

Use current stable releases when implementation begins. Avoid hard-pinning product decisions in docs unless a dependency requires it. Runtime versions should be recorded in package manifests and lockfiles once dependencies are installed.

## Frontend Stack

### `frontend/web`

- Next.js App Router with server and client components.
- Wall of Shame gallery at `/` (async server component, fetches `/api/roasts` with 30s revalidation).
- Server-rendered `/roast/[id]` pages with dynamic Open Graph + Twitter Card metadata.
- Client component `CopyButton` for copy-to-clipboard roast URL sharing.
- API routes co-located under `app/api/`:
  - `POST /api/upload` — validate, generate caption, store image, publish roast, return `linkedInShareUrl` for demo mode.
  - `GET /api/roasts` — list public roasts.
  - `GET|PATCH|DELETE /api/roasts/[id]` — detail, hide (admin), delete (admin).
  - `POST /api/share/[id]` — mark roast as shared.
- Admin/owner endpoints protected by `x-admin-token` header against `ADMIN_TOKEN` env var.
- In-memory mock client runs when `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` are unset.
- No provider SDKs in client component code.

### `frontend/extension`

- Manifest V3 extension.
- JavaScript source with focus on small popup footprint.
- `chrome.storage.local` for settings.
- `chrome.alarms` for randomized capture scheduling.
- `chrome.tabs.captureVisibleTab` for screenshot capture.

## Backend Services

### `backend/services/shared`

Owns shared contracts (`buildUploadResponse`, `buildLinkedInShareUrl`, `buildErrorResponse`), domain types via JSDoc (`CaptureMode`, `Roast`, `UploadRequest`, `UploadResponse`, `ShareStatus`), and request validation (`validateUploadRequest`). Imported by all other packages and API routes.

### `backend/services/random-trigger`

Owns Poisson/exponential interval generation, intensity presets, clamping, and deterministic tests.

### `backend/services/storage`

Owns Supabase Postgres schema, SQL migrations, and Supabase client + repository layer. Exposes `createSupabaseClient`, and full CRUD via `roastsRepository`: `createProcessingRoast`, `uploadRoastImage`, `publishRoast`, `markRoastFailed`, `listPublicRoasts`, `getPublicRoast`, `hideRoast`, `deleteRoast`, `updateShareStatus`. Depends on `@supabase/supabase-js`.

### `backend/services/ai`

Owns the roast prompt (`ROAST_SYSTEM_PROMPT`), OpenAI provider adapter via `/v1/responses` with JSON structured output, caption validation (`normalizeCaption`), and fallback caption. Exposes `generateRoastCaption`, `buildResponsesRequest`. Fallback caption returns when no `OPENAI_API_KEY` is set. Depends on `openai`.

### `backend/services/privacy`

Placeholder for future redaction, caption safety helpers, consent copy helpers, and privacy-focused fixtures. Not an active MVP dependency.

### `backend/services/social`

Owns LinkedIn share URL generation (`generateLinkedInShareUrl`), share status management (`getInitialShareStatus`, `isShareable`, `isFailed`, `isValidShareStatus`). Returns `"link_ready"` for `demo_linkedin_link` capture mode. 21 unit tests covering URL building, extraction, and status transitions.

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

- Provider integrations (Supabase, OpenAI) stay inside backend service adapters so local demo mode works without every external service. A mock Supabase client runs when credentials are missing.
- Request and response contracts live in `backend/services/shared/src/contracts`.
- Domain types and enums live in `backend/services/shared/src/types`.
- Runtime validation lives in `backend/services/shared/src/validation`.
- Do not store raw base64 screenshots after successful image upload — the API generates the caption first, then uploads the image.
- AI output is validated by `normalizeCaption` (JSON parse, whitespace trim, 220 char cap) before publishing.
- API routes in `frontend/web/app/api/` delegate to backend service packages via workspace imports.
- Manual capture, Screenshot + LinkedIn Link, and manual sharing are implemented. Randomized scheduling is next.
- The web portal falls back to static demo data when the API is unreachable (e.g., during local development without a running server).
