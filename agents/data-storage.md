# Data Storage Agent

## Mission

Design, implement, and protect Uncognito's Supabase-backed persistence layer: roast metadata, screenshot object storage, public-safe IDs, status transitions, share state, and storage contracts used by the backend API and public portal.

The storage layer must make the hackathon demo reliable while preserving the product's privacy constraints: explicit opt-in, public-only reads, hide/delete controls, and no long-term raw base64 storage.

## Owns

- Supabase Postgres schema.
- Supabase Storage bucket layout.
- SQL migrations and initialization scripts.
- Storage repository interface used by `backend/api`.
- Public-safe roast ID generation.
- Roast status transitions.
- Image object paths and public URL generation.
- Hide/delete storage behavior.
- Share status persistence.
- Failure records and non-sensitive diagnostics.

## Does Not Own

- Extension local settings implementation.
- AI prompt wording or roast style.
- Portal UI layout.
- Social provider APIs.
- API request validation outside storage-specific constraints.
- User-facing privacy copy, except where storage behavior must support it.

## Source Documents

- `docs/PRD.md`
- `docs/techstack.md`
- `docs/repo-structure.md`
- `agents/backend-judge.md`
- `agents/web-vault.md`
- `agents/social-sharing.md`
- `agents/product-orchestrator.md`

## Supabase Decision

Supabase is the source of truth for deployed persistence.

- **Database:** Supabase Postgres.
- **Image storage:** Supabase Storage bucket named `roast-images`.
- **Backend client:** uses a service-role key for privileged writes, deletes, and object cleanup.
- **Publishable client:** may be used only for public reads if a future frontend path needs direct Supabase access.
- **Frontend rule:** frontend code should call `backend/api` for storage mutations. It must not receive the service-role key.

## Environment Variables

```text
SUPABASE_URL=https://dgsqalakuycjxdnsdrnl.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_swa3MqwbsGNDQpYaiG9wGw_urwihpaa
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=roast-images
PUBLIC_APP_URL=http://localhost:3000
```

Credential policy:

- `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` are safe for public-client configuration.
- `SUPABASE_SERVICE_ROLE_KEY` is backend-only and must never be exposed to `frontend/`.
- The backend can create public URLs for images, but all mutation paths must go through `backend/api`.

## Storage Architecture

```text
Extension
  -> backend/api upload route
  -> storage service creates processing record
  -> storage service uploads screenshot object to Supabase Storage
  -> AI service generates caption
  -> storage service publishes roast row
  -> web frontend reads public roast through API or server-side storage adapter
```

The storage service must expose a small repository interface so API route handlers do not depend on Supabase table details.

## Supabase Objects

### Bucket: `roast-images`

Purpose: public images for Open Graph previews and roast pages.

Recommended settings:

- Public bucket for MVP preview reliability.
- Object size limit enforced by application code.
- Accepted content types: `image/png`, `image/jpeg`, `image/webp`.
- Object path format: `roasts/{roastId}/capture.{ext}`.
- Do not use uploaded filenames or source tab names in object paths.
- The initial migration creates the bucket with a 10 MB object limit and image-only MIME types.

Privacy behavior:

- Public roasts keep the object available.
- Hidden roasts are removed from public pages immediately.
- Hide should attempt to delete the object from the public bucket.
- Delete should mark the row deleted, remove the object, and retain only the minimum tombstone metadata needed for abuse prevention or debugging.

### Table: `roasts`

Stores one record per screenshot/roast attempt.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `text` | Yes | Public-safe ID, formatted like `rst_<hex>` |
| `status` | `roast_status` | Yes | `processing`, `public`, `hidden`, `failed`, `deleted` |
| `image_bucket` | `text` | No | Defaults to `roast-images` |
| `image_path` | `text` | No | Supabase Storage object path |
| `image_url` | `text` | No | Public URL used by pages and OG metadata |
| `caption` | `text` | No | Required before `status = public` |
| `source_host` | `text` | No | Redacted hostname from active tab |
| `source_title` | `text` | No | Tab title if collected; avoid storing obviously sensitive titles |
| `capture_mode` | `capture_mode` | Yes | `random`, `manual`, or `demo_linkedin_link` |
| `client_timestamp` | `timestamptz` | No | Timestamp reported by extension |
| `themes` | `jsonb` | Yes | AI theme tags, default `[]` |
| `share_status` | `share_status` | Yes | `not_shared`, `link_ready`, `shared`, or `failed` |
| `error_reason` | `text` | No | Non-sensitive failure reason |
| `created_at` | `timestamptz` | Yes | Server creation time |
| `updated_at` | `timestamptz` | Yes | Server update time |
| `hidden_at` | `timestamptz` | No | Set when hidden |
| `deleted_at` | `timestamptz` | No | Set when deleted |

Public-read rule:

- Only rows with `status = 'public'` are visible through public list/detail paths.

Constraint rule:

- Public rows must have `caption`, `image_path`, and `image_url`.

### Table: `roast_events`

Stores non-sensitive status transition history.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `uuid` | Yes | Default generated UUID |
| `roast_id` | `text` | Yes | References `roasts.id` |
| `event_type` | `text` | Yes | Example: `created`, `image_uploaded`, `published`, `hidden`, `deleted`, `failed`, `shared` |
| `actor` | `text` | Yes | `system`, `owner`, `api`, or provider name |
| `metadata` | `jsonb` | Yes | Non-sensitive event metadata |
| `created_at` | `timestamptz` | Yes | Server event time |

Events must never store raw screenshots, raw base64, full AI prompts, API keys, or sensitive strings from screenshots.

### Optional Table: `upload_attempts`

Use only if API rate limiting needs persistence across serverless instances.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `uuid` | Yes | Default generated UUID |
| `client_fingerprint` | `text` | Yes | Hash or anonymous client key |
| `capture_mode` | `capture_mode` | Yes | Upload source mode |
| `outcome` | `text` | Yes | `accepted`, `rate_limited`, `rejected`, or `failed` |
| `roast_id` | `text` | No | References created roast if accepted |
| `error_code` | `text` | No | Stable API error code |
| `created_at` | `timestamptz` | Yes | Server event time |

## Repository Interface

The backend should depend on storage functions, not direct table access.

```ts
type CreateProcessingRoastInput = {
  sourceHost?: string;
  sourceTitle?: string;
  captureMode: "random" | "manual" | "demo_linkedin_link";
  clientTimestamp?: string;
};

type PublishRoastInput = {
  roastId: string;
  imagePath: string;
  imageUrl: string;
  caption: string;
  themes?: string[];
};

type StorageRepository = {
  createProcessingRoast(input: CreateProcessingRoastInput): Promise<Roast>;
  uploadRoastImage(input: UploadRoastImageInput): Promise<{ imagePath: string; imageUrl: string }>;
  publishRoast(input: PublishRoastInput): Promise<Roast>;
  markRoastFailed(roastId: string, reason: string): Promise<Roast>;
  listPublicRoasts(input: ListRoastsInput): Promise<PaginatedRoasts>;
  getPublicRoast(id: string): Promise<Roast | null>;
  getOwnerRoast(id: string): Promise<Roast | null>;
  hideRoast(id: string, actor: "owner" | "system"): Promise<Roast>;
  deleteRoast(id: string, actor: "owner" | "system"): Promise<void>;
  updateShareStatus(id: string, status: "not_shared" | "link_ready" | "shared" | "failed"): Promise<Roast>;
};
```

## Upload Transaction Policy

Supabase Storage object writes and Postgres row updates are not one database transaction. Use compensating cleanup.

Recommended flow:

1. `createProcessingRoast` inserts a `processing` row.
2. `uploadRoastImage` uploads the screenshot object to `roast-images`.
3. AI generation runs using the hosted image URL or sanitized image payload.
4. `publishRoast` updates the row to `public`.
5. If image upload fails, mark the row `failed`.
6. If AI generation fails, either publish with a fallback caption or mark the row `failed`.
7. If publishing fails after image upload, delete the uploaded object and mark the row `failed`.

The public gallery and detail pages must ignore `processing`, `hidden`, `failed`, and `deleted` rows.

## RLS and Access Control

Minimum policy:

- Enable Row Level Security on `roasts`, `roast_events`, and `upload_attempts`.
- Allow anonymous/public select only from `roasts` where `status = 'public'` if direct Supabase public reads are used.
- Do not allow anonymous insert, update, or delete.
- Use backend service-role access for inserts, updates, deletes, event writes, and storage object deletion.
- Owner hide/delete still requires `ADMIN_TOKEN` at the API layer.

The MVP can read public roasts through `backend/api` instead of direct Supabase public policies. If so, keep public table policies disabled and let the API own all reads.

## Error Handling

| Failure | Storage behavior |
| --- | --- |
| Supabase unavailable | Return stable API error and do not publish |
| Row insert fails | Do not upload image |
| Image upload fails | Mark row `failed`; no public page |
| AI fails | Publish fallback caption or mark `failed`, based on Backend Judge decision |
| Publish update fails | Delete uploaded object if possible; mark row `failed` |
| Hide fails to delete image | Keep row hidden and record event metadata with non-sensitive reason |
| Delete fails to delete image | Keep row hidden/deleted and surface retryable owner error |
| Public URL generation fails | Mark row `failed`; do not publish |

## Privacy Requirements

- Never store raw base64 after successful object upload.
- Never store cookies, full browser history, or page HTML.
- Do not store full AI prompts when prompts may include screenshot text.
- Do not store raw OCR output unless a later PRD explicitly requires it.
- Hidden/deleted rows must not appear in public list or detail queries.
- Public image URLs are acceptable for public roasts, but hide/delete must attempt object removal.

## Collaboration Contracts

- **Backend Judge Agent:** consumes repository functions for upload orchestration, status updates, and error handling.
- **Web Vault Agent:** consumes public read functions or API responses for gallery and detail pages.
- **AI Roast Agent:** receives only the image URL/path needed for caption generation and returns caption/themes.
- **Product Orchestrator:** owns the active MVP privacy policy and hide/delete requirements while redaction is deferred.
- **Social Sharing Agent:** calls `updateShareStatus` after webhook or manual share attempts.

## Testing Checklist

- Migrations create required enums, tables, indexes, functions, and policies.
- `createProcessingRoast` creates a non-public row.
- `publishRoast` requires caption, image path, and image URL.
- `listPublicRoasts` excludes `processing`, `hidden`, `failed`, and `deleted` rows.
- `getPublicRoast` returns `null` for hidden/deleted/failed IDs.
- `hideRoast` updates status, timestamp, event log, and attempts image deletion.
- `deleteRoast` tombstones or removes the record according to API policy and attempts image deletion.
- `uploadRoastImage` rejects unsupported content types and oversized images.
- Service-role key is never imported by frontend code.
- Supabase publishable key cannot mutate storage or tables under RLS policies.

## Definition of Done

- Supabase is the authoritative deployed database and image-storage provider.
- Backend can create, publish, list, hide, and delete roast records through one storage boundary.
- Public pages can render public roast images using stable Supabase Storage URLs.
- Hidden, failed, processing, and deleted records are not public.
- Object cleanup is attempted for hide/delete and failed publish paths.
- Storage tests cover success, failure, and privacy-sensitive paths.
