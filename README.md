# Uncognito

Uncognito is a small hackathon MVP for opt-in browser accountability: a Chrome extension captures unpredictable screenshots, a backend generates AI roasts, and a web portal publishes shareable Wall of Shame entries.

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
