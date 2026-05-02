# Data Storage Agent

## Mission

Define and implement the persistence layer for roast records, settings, image-provider boundaries, and public-safe IDs.

## Owns

- Roast schema.
- Settings schema if stored server-side.
- Database adapter.
- Image provider adapter boundary.
- Migration or initialization scripts.
- Public-safe ID generation.

## Does Not Own

- Extension local settings implementation.
- AI prompt details.
- Portal UI.
- Social provider APIs.

## Inputs

- Data model from PRD.
- Backend API needs.
- Web portal read needs.
- Product hide/delete requirements.
- Hosted-image requirement for Open Graph previews.

## Required Outputs

- Storage contract for creating, reading, listing, hiding, and deleting roasts.
- Image upload contract that returns a stable public URL.
- Schema supporting statuses: `public`, `hidden`, `failed`, `deleted`.
- Timestamps for creation and updates.
- Local development fallback if hosted services are unavailable.

## Roast Fields

| Field | Required | Notes |
| --- | --- | --- |
| `id` | Yes | Public-safe unique ID |
| `imageUrl` | Yes | Hosted image URL |
| `caption` | Yes | AI-generated or fallback caption |
| `status` | Yes | `public`, `hidden`, `failed`, or `deleted` |
| `createdAt` | Yes | Capture creation time |
| `updatedAt` | Yes | Last state change |
| `sourceHost` | No | Domain if collected |
| `sourceTitle` | No | Tab title if collected |
| `themes` | No | JSON theme metadata |
| `shareStatus` | No | `not_shared`, `link_ready`, `shared`, or `failed` |
| `errorReason` | No | Failure diagnostics without sensitive data |

## Environment Variables

```text
DATABASE_URL=
IMAGE_PROVIDER=
IMAGE_PROVIDER_API_KEY=
PUBLIC_APP_URL=
```

## Industry Practices

- Keep database access behind a small repository interface.
- Avoid leaking database IDs if a public-safe ID is required.
- Store status transitions explicitly.
- Never store raw base64 after successful image upload.
- Make provider adapters replaceable for local demo and deployed demo.

## Collaboration Contracts

- **Produces:** storage functions for Backend Judge Agent.
- **Produces:** read functions for Web Vault Agent.
- **Consumes:** hide/delete policy from Product Orchestrator and Backend Judge Agent.
- **Hands off to Social Sharing Agent:** `shareStatus` persistence.

## Testing Checklist

- Create roast persists required fields.
- List roasts excludes hidden/deleted entries by default.
- Detail lookup respects hidden/deleted behavior.
- Hide/delete updates status and timestamps.
- Image upload adapter returns a public URL.
- Failed records do not appear in the public gallery.

## Definition of Done

- Backend can create and retrieve roast records through one storage boundary.
- Web pages can list and display public roasts.
- Hidden/deleted records are not public.
- Deployed images are usable in Open Graph metadata.
