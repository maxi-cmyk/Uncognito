# Storage Service

The storage service owns Supabase-backed persistence and image storage for Uncognito.

## Responsibilities

- Store roast metadata in Supabase Postgres.
- Store screenshot images in Supabase Storage.
- Generate public-safe roast IDs.
- Expose repository functions to `backend/api`.
- Track non-sensitive status transition events.
- Keep hidden, failed, processing, and deleted roasts out of public reads.
- Attempt object cleanup when roasts are hidden, deleted, or fail after upload.

## Supabase Resources

- Database: Supabase Postgres.
- Storage bucket: `roast-images`.
- Main table: `public.roasts`.
- Event table: `public.roast_events`.
- Optional rate-limit table: `public.upload_attempts`.

## Environment Variables

```text
SUPABASE_URL=https://dgsqalakuycjxdnsdrnl.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_swa3MqwbsGNDQpYaiG9wGw_urwihpaa
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=roast-images
PUBLIC_APP_URL=http://localhost:3000
```

`SUPABASE_SERVICE_ROLE_KEY` is backend-only. Do not expose it to `frontend/`.

## Public Image Strategy

Open Graph crawlers need stable public image URLs. For the MVP, uploaded roast screenshots live in a public Supabase Storage bucket with unguessable object paths:

```text
roasts/{roastId}/capture.{png|jpg|webp}
```

Hide/delete flows must remove the public object when possible. Public pages must also filter by roast status, so a hidden row is not discoverable through normal product URLs.

## Repository Boundary

The API should call storage functions rather than Supabase directly:

- `createProcessingRoast`
- `uploadRoastImage`
- `publishRoast`
- `markRoastFailed`
- `listPublicRoasts`
- `getPublicRoast`
- `getOwnerRoast`
- `hideRoast`
- `deleteRoast`
- `updateShareStatus`

See `agents/data-storage.md` for the full design contract.
