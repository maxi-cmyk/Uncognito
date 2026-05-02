# Uncognito

Uncognito is a small hackathon MVP for opt-in browser accountability: a Chrome extension captures unpredictable screenshots, a backend generates AI roasts, and a web portal publishes shareable Wall of Shame entries.

## Requirements

- Node.js 22 or newer. Current tests were verified with Node `v22.19.0`.
- npm 11 or newer. npm is used for workspace scripts; `pnpm` is not required for the current repo commands.
- No npm package install is required for the backend service and integration tests implemented so far. They use Node's built-in test runner.

Optional environment variables live in `.env.example`:

- `OPENAI_API_KEY` - enables the live OpenAI roast fixture test. Without it, that live test is skipped and fallback-caption tests still run.
- `OPENAI_VISION_MODEL` - overrides the default roast model.
- `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_STORAGE_BUCKET` - required once Supabase storage adapters are implemented beyond the current schema/migration docs.

If future packages add external dependencies, install from the repo root with:

```sh
npm install
```

## Testing

Run the current cross-service backend integration test:

```sh
node --test tests/backend-services.integration.test.js
```

Run all currently wired tests:

```sh
npm test
```

## Repo Map

- `docs/` - product, architecture, stack, and structure documentation.
- `agents/` - functional agent briefs derived from the PRD.
- `frontend/web/` - Next.js web portal.
- `frontend/extension/` - Chrome Manifest V3 extension.
- `backend/api/` - upload, roast, admin, and sharing API surface.
- `backend/services/` - backend domain services for contracts, scheduling, storage, AI, and social sharing.
- `tests/` - cross-application end-to-end fixtures and flows.
- `scripts/` - local development and automation scripts.
- `config/` - shared tool configuration.

Start with [docs/PRD.md](docs/PRD.md), [docs/techstack.md](docs/techstack.md), and [docs/repo-structure.md](docs/repo-structure.md).
