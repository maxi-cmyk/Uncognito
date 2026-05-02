# Tech Stack

## Stack Summary

Uncognito uses a TypeScript repo split into `frontend/` and `backend/`. The frontend contains the public portal and browser extension. The backend contains the API plus focused services for contracts, storage, AI, scheduling, and social sharing.

| Layer | Choice | Why |
| --- | --- | --- |
| Language | TypeScript | Shared types across frontend, extension, API, and backend services. |
| Package manager | pnpm workspaces | Fast installs and clear workspace boundaries. |
| Web frontend | Next.js | Server-rendered public pages and dynamic Open Graph metadata. |
| Extension frontend | Chrome Manifest V3 | Required platform for alarms, popup UI, storage, and visible-tab capture. |
| Backend API | TypeScript HTTP API | Keeps upload, roast, hide/delete, and share endpoints separate from frontend code. |
| Hosting | Vercel or equivalent Node/serverless host | Low-friction public URLs for hackathon demos. |
| Database | Turso SQLite | Hosted SQLite fits the PRD and keeps persistence simple. |
| ORM/query layer | Drizzle ORM | Type-safe SQLite schema and migrations without a heavy runtime. |
| Image storage | Cloudinary primary, ImgBB fallback | Hosted public URLs are required for Open Graph images. |
| AI | OpenAI vision-capable model via env config | The roast generator needs screenshot understanding and controlled text output. |
| Social sharing | Manual link and LinkedIn share-link demo flow first; Telegram/Discord webhooks optional | Manual share is reliable for demos; webhooks are easier than LinkedIn automation. |
| Unit testing | Vitest | Fast TypeScript tests for services, scheduling, contracts, and adapters. |
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

Owns database schema, Drizzle migrations, Turso connection code, image-provider adapters, and public-safe ID generation.

### `backend/services/ai`

Owns the roast prompt, AI provider adapter, caption validation, theme metadata, and fallback captions.

### `backend/services/privacy`

Placeholder for future redaction, caption safety helpers, consent copy helpers, and privacy-focused fixtures. It is not an active MVP dependency.

### `backend/services/social`

Owns copy/share helpers, Telegram or Discord webhook adapters, and share status normalization.

## Environment Variables

```text
DATABASE_URL=
IMAGE_PROVIDER=
IMAGE_PROVIDER_API_KEY=
OPENAI_API_KEY=
OPENAI_VISION_MODEL=
PUBLIC_APP_URL=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
DISCORD_WEBHOOK_URL=
ADMIN_TOKEN=
```

Only variables for enabled providers are required. Local development may use mock image storage and fallback captions.

## Implementation Notes

- Keep provider integrations behind backend service adapters so local demo mode can work without every external service.
- Put request and response contracts in `backend/services/shared` before implementing dependent API routes or extension calls.
- Do not store raw base64 screenshots after successful image upload.
- Treat AI output as untrusted and validate it before publishing.
- Make manual capture, Screenshot + LinkedIn Link, and manual sharing work before randomized scheduling or automated posting.
