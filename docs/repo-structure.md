# Repo Structure

This repository is organized around the simple product boundary the team wants:

- `frontend/` contains user-facing browser surfaces.
- `backend/` contains the API and backend domain services.

```text
.
|-- README.md
|-- .env.example
|-- .gitignore
|-- package.json
|-- pnpm-workspace.yaml
|-- agents/
|   |-- README.md
|   |-- ai-roast-generator.md
|   |-- backend-judge.md
|   |-- data-storage.md
|   |-- extension-scout.md
|   |-- product-orchestrator.md
|   |-- qa-demo.md
|   |-- random-trigger.md
|   |-- social-sharing.md
|   `-- web-vault.md
|-- frontend/
|   |-- README.md
|   |-- web/
|   |   |-- README.md
|   |   |-- package.json
|   |   |-- app/
|   |   |   |-- admin/
|   |   |   |-- components/
|   |   |   |-- lib/
|   |   |   `-- roast/[id]/
|   |   |-- public/
|   |   `-- tests/
|   `-- extension/
|       |-- README.md
|       |-- package.json
|       |-- public/
|       |-- src/
|       |   |-- background/
|       |   |-- content/
|       |   |-- lib/
|       |   `-- popup/
|       `-- tests/
|-- backend/
|   |-- README.md
|   |-- api/
|   |   |-- README.md
|   |   |-- package.json
|   |   `-- routes/
|   |       |-- roasts/
|   |       |   `-- [id]/
|   |       `-- upload/
|   `-- services/
|       |-- README.md
|       |-- ai/
|       |   |-- README.md
|       |   |-- package.json
|       |   |-- src/
|       |   |   |-- prompts/
|       |   |   `-- providers/
|       |   `-- tests/
|       |-- privacy/
|       |   |-- README.md
|       |   `-- package.json
|       |-- random-trigger/
|       |   |-- README.md
|       |   |-- package.json
|       |   |-- src/
|       |   `-- tests/
|       |-- shared/
|       |   |-- README.md
|       |   |-- package.json
|       |   |-- src/
|       |   |   |-- contracts/
|       |   |   |-- types/
|       |   |   `-- validation/
|       |   `-- tests/
|       |-- social/
|       |   |-- README.md
|       |   |-- package.json
|       |   |-- src/providers/
|       |   `-- tests/
|       `-- storage/
|           |-- README.md
|           |-- package.json
|           |-- migrations/
|           |-- src/
|           |   |-- db/
|           |   `-- supabase/
|           `-- tests/
|-- tests/
|   |-- README.md
|   |-- backend-services.integration.test.js
|   |-- e2e/
|   `-- fixtures/
|-- scripts/
|   `-- README.md
|-- config/
|   `-- README.md
`-- docs/
    |-- PRD.md
    |-- repo-structure.md
    `-- techstack.md
```

## Ownership

- `frontend/web` belongs primarily to the Web Vault Agent.
- `frontend/extension` belongs primarily to the Extension Scout Agent and Random Trigger Agent.
- `backend/api` belongs primarily to the Backend Judge Agent.
- `backend/services/shared` belongs to all agents through contract review.
- `backend/services/random-trigger` belongs to the Random Trigger Agent.
- `backend/services/storage` belongs to the Data Storage Agent.
- `backend/services/ai` belongs to the AI Roast Agent.
- `backend/services/privacy` is a future-work placeholder owned by the Product Orchestrator until privacy automation is scheduled.
- `backend/services/social` belongs to the Social Sharing Agent.
- `tests` belongs to the QA Demo Agent.
- `docs` and `agents` belong to the Product Orchestrator unless a specific functional owner needs to update its own contract.

## Conventions

- Frontend code never calls provider SDKs directly. It calls `backend/api`.
- Shared request and response contracts go in `backend/services/shared/src/contracts`.
- Shared domain types go in `backend/services/shared/src/types`.
- Runtime validation schemas go in `backend/services/shared/src/validation`.
- Provider integrations stay inside `backend/services/*/src/providers` or equivalent adapter folders.
- Feature tests live near the frontend app, backend API, or service they verify.
- Cross-service integration tests live in root `tests/*.test.js`.
- Cross-surface browser flows live in root `tests/e2e`.
- Fixture data that may be reused across frontend and backend lives in root `tests/fixtures`.
