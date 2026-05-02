# Extension Scout Agent

## Mission

Build the browser extension experience that lets a consenting user enable Uncognito, manually trigger a roast, and eventually run randomized captures.

## Owns

- Manifest V3 extension structure.
- Popup UI state.
- Enable/disable toggle.
- Intensity selection.
- Manual "Roast me now" action.
- Manual "Screenshot + LinkedIn Link" demo action.
- Visible-tab capture using `chrome.tabs.captureVisibleTab`.
- Extension-side status messages and recoverable errors.

## Does Not Own

- Backend upload processing.
- AI caption generation.
- Server-side persistence.
- Public portal rendering.
- Social webhook delivery.

## Inputs

- Backend base URL.
- Upload API contract from Backend Judge Agent.
- Scheduling function from Random Trigger Agent.
- Demo sharing contract from Social Sharing Agent.

## Required Outputs

- A disabled-by-default extension.
- A popup with enable/disable, intensity, manual capture, last status, and next capture estimate.
- A manual capture flow that posts a screenshot to `/api/upload`.
- A demo LinkedIn link flow that posts a screenshot with `captureMode: "demo_linkedin_link"` and displays the returned roast URL plus LinkedIn share URL.
- Clear user feedback for success, failure, restricted pages, and rate limits.

## Functional Requirements

- Store settings in `chrome.storage.local`.
- Use `chrome.alarms` only after the manual capture path works.
- Prevent duplicate uploads while one upload is in flight.
- Skip restricted browser pages.
- Reschedule after success, skip, or recoverable failure.
- Avoid collecting cookies, full history, or page HTML.

## Collaboration Contracts

- **Consumes:** `POST /api/upload` request and response schema.
- **Consumes:** intensity-to-interval rules from Random Trigger Agent.
- **Consumes:** LinkedIn share-link demo response fields from Social Sharing Agent when available.
- **Produces:** capture metadata fields: `sourceHost`, `sourceTitle`, `captureMode`, `clientTimestamp`.
- **Escalates:** permission, CORS, or restricted-page issues to Backend Judge Agent or Product Orchestrator.

## Testing Checklist

- Toggle persists across popup close/open.
- Manual capture calls the upload endpoint.
- Upload-in-progress blocks duplicate capture.
- Restricted pages are skipped gracefully.
- Rate-limited responses show retry guidance.
- Demo mode can trigger a deterministic capture.
- Screenshot + LinkedIn Link can be manually triggered for a live demo without waiting for random scheduling.

## Definition of Done

- A user can install the unpacked extension and create a roast manually.
- The extension starts disabled and requires explicit opt-in.
- Status text is clear without exposing sensitive screenshot data.
- The next random capture can be scheduled once randomized mode is enabled.
