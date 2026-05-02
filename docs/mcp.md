# MCP Setup

This repo uses hosted MCP servers for the external services in the PRD:

- Vercel MCP for deployment, project inspection, deployment logs, and production URL checks.
- Supabase MCP for Postgres, migrations, generated types, documentation lookup, and Storage bucket checks.

## Configured Servers

The current local Codex setup uses:

```text
vercel
url: https://mcp.vercel.com

supabase
url: https://mcp.supabase.com/mcp?project_ref=dgsqalakuycjxdnsdrnl&features=database,development,docs,storage
```

`project_ref=dgsqalakuycjxdnsdrnl` comes from the PRD Supabase URL:

```text
https://dgsqalakuycjxdnsdrnl.supabase.co
```

The Supabase MCP includes the `storage` feature group because Uncognito's deployed demo depends on public Supabase Storage URLs for Open Graph image previews.

## Recreate Locally

From the repo root:

```sh
codex mcp add vercel --url https://mcp.vercel.com
codex mcp login vercel

codex mcp add supabase --url 'https://mcp.supabase.com/mcp?project_ref=dgsqalakuycjxdnsdrnl&features=database,development,docs,storage'
codex mcp login supabase
```

Restart the Codex session after adding MCPs so the newly configured tools are loaded into the active tool list.

## PRD Interaction Contract

### Upload And Publish Flow

Use Supabase MCP to verify and manage:

- `public.roasts`
- `public.roast_events`
- `public.upload_attempts` if rate limiting is implemented
- `roast-images` Storage bucket
- SQL migrations under `backend/services/storage/migrations`

Use Vercel MCP to verify and manage:

- deployed web/API project
- deployment logs for `/api/upload`, `/api/roasts`, `/api/roasts/:id`, `/api/share/:id`
- production URL used by `PUBLIC_APP_URL`
- Open Graph rendering for `/roast/[id]`
- `/api/upload` response includes `linkedInShareUrl` when `captureMode` is `demo_linkedin_link`

Expected PRD flow:

```text
Extension screenshot
  -> Vercel API route /api/upload
  -> Supabase Storage upload
  -> Supabase Postgres roast row
  -> Vercel /roast/[id] public page
  -> Social crawler reads OG tags and Supabase public image URL
```

### Environment Contract

Vercel environment variables must include:

```text
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_STORAGE_BUCKET
OPENAI_API_KEY
OPENAI_VISION_MODEL
PUBLIC_APP_URL
ADMIN_TOKEN
```

`SUPABASE_SERVICE_ROLE_KEY` is backend-only. Do not expose it to `frontend/` code or public client bundles.

## Operational Guardrails

- Prefer read-only checks first: list projects, list tables, list buckets, inspect deployments, and inspect logs.
- Apply migrations only from reviewed files in `backend/services/storage/migrations`.
- Do not run ad hoc destructive SQL through MCP.
- Do not write or expose secrets in tracked files.
- Use Vercel MCP for deployment/runtime visibility and Supabase MCP for data/storage visibility; API route implementation should still keep provider access behind backend service adapters.
