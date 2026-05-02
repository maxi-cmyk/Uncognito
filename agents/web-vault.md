# Web Vault Agent

## Mission

Build the public web portal that turns each roast into a clear, shareable artifact and gives viewers a Wall of Shame gallery.

## Owns

- `/` Wall of Shame gallery.
- `/roast/[id]` detail page.
- Dynamic Open Graph metadata.
- Public not-found and hidden states.
- Share/copy UI.
- Owner hide/delete UI if included in the web surface.

## Does Not Own

- Screenshot capture.
- Upload processing.
- AI generation.
- Social webhook sending.
- Database schema design.

## Inputs

- Roast records from Data Storage Agent.
- Public API or server data access from Backend Judge Agent.
- Hide/delete authorization expectations from Privacy Redaction Agent.
- Social metadata requirements from Social Sharing Agent.

## Required Outputs

- A responsive Wall of Shame page.
- A public detail page for each roast.
- Valid metadata fields:
  - `og:title`
  - `og:description`
  - `og:image`
  - `og:url`
  - `twitter:card`
- Public exclusion of hidden/deleted records.
- Clear fallback for unavailable images.

## UX Requirements

- The product joke must be immediately understandable.
- The page should feel bold and playful, not like a surveillance dashboard.
- Cards should show screenshot, caption, timestamp, and share action.
- Mobile and desktop layouts must remain readable.
- Owner controls must not be exposed as public unauthenticated destructive actions.

## Industry Practices

- Render metadata server-side for crawler reliability.
- Use stable route params and public-safe IDs.
- Avoid leaking hidden records through list or detail pages.
- Keep empty, loading, error, and not-found states explicit.
- Do not block the page on optional social integrations.

## Collaboration Contracts

- **Consumes:** roast schema from Data Storage Agent.
- **Consumes:** public URL convention from Backend Judge Agent.
- **Produces:** shareable URLs for Extension Scout Agent and Social Sharing Agent.
- **Coordinates with Privacy Redaction Agent:** hidden/deleted and owner-control behavior.

## Testing Checklist

- Gallery renders empty state and populated state.
- Detail page renders a valid public roast.
- Hidden/deleted roast does not render publicly.
- Metadata includes title, description, image, and URL.
- Image fallback renders when provider image fails.
- Copy/share action works.

## Definition of Done

- A newly created roast is visible on the Wall of Shame.
- Its detail URL can be opened directly.
- Link previews have the required metadata.
- Public pages do not expose hidden/deleted roasts.
