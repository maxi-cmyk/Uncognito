# Supabase Setup

How to configure Supabase for the Uncognito backend.

## Prerequisites

- A Supabase project with Postgres and Storage enabled.
- The project URL and keys from the Supabase dashboard (Settings → API).

## 1. Apply the Database Migration

From the Supabase dashboard SQL Editor, or via the Supabase CLI:

```sh
# Via Supabase CLI:
supabase db push

# Or manually in SQL Editor: paste the contents of:
# backend/services/storage/migrations/001_initial_supabase_storage.sql
```

This creates:
- `public.roasts` table with enums, indexes, triggers, and RLS policies
- `public.roast_events` table for status transition history
- `public.upload_attempts` table for rate limiting
- `roast-images` Storage bucket (public, 10MB limit, image-only MIME types)

## 2. Verify the Setup

Run these queries in the SQL Editor to confirm everything is in place:

```sql
SELECT * FROM public.roasts LIMIT 1;
SELECT * FROM storage.buckets WHERE id = 'roast-images';
SELECT enum_range(NULL::public.capture_mode);
```

Expected enums: `{random,manual,demo_linkedin_link}`

## 3. Configure Environment Variables

Add to your `.env`:

```text
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_PUBLISHABLE_KEY=eyJhbGciOi... (public anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi... (service_role key — backend only)
SUPABASE_STORAGE_BUCKET=roast-images
```

For Vercel deployment, set these in the Vercel project environment variables.

### ⚠️ Security

- `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to `frontend/` code or public bundles.
- The backend uses this key for inserts, updates, deletes, and storage object management.
- The frontend reads roasts through `backend/api/roasts`, not via direct Supabase calls.

## 4. Run the Dev Server

```sh
npm install
npm run dev --workspace @uncognito/web
```

Check the logs for `SUPABASE_URL` — if it's set, the real Supabase client will be used. If unset, an in-memory mock client runs instead.

## 5. Verify Upload Flow

```sh
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{
    "imageBase64": "data:image/png;base64,iVBORw0KGgo=",
    "sourceHost": "test.example.com",
    "captureMode": "manual"
  }'
```

Should return a 201 with `id`, `caption`, `imageUrl`, `publicUrl`. The roast should appear at `http://localhost:3000`.

## 6. Verify in Supabase

```sql
SELECT id, status, capture_mode, share_status, created_at FROM public.roasts ORDER BY created_at DESC LIMIT 10;
```

The newly created roast should show `status = 'public'`.

## Troubleshooting

| Symptom | Check |
|---|---|
| "Failed to create roast: Not found" | Ensure the migration has been applied (table `public.roasts` exists) |
| "Failed to upload image" | Check that `roast-images` bucket exists and is public |
| Record created but no image | Verify `SUPABASE_SERVICE_ROLE_KEY` has storage write permissions |
| Rate limit errors on first request | `upload_attempts` RLS policy may be blocking — set to service_role only |
