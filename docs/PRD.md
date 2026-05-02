# Product Requirements Document: Uncognito

## 1. Executive Summary

**Project Name:** Uncognito  
**Project Type:** Small hackathon MVP  
**Core Idea:** A deliberately chaotic accountability app that captures random browser screenshots, uses AI vision to generate a sharp roast, and publishes the result to a shareable web page that can be posted to social channels.

Uncognito turns hidden procrastination into public theater. A browser extension takes unpredictable screenshots, the backend generates an AI roast, and a web portal displays the capture as a public "Wall of Shame" entry with social-preview metadata.

The product is intentionally absurd, but the implementation should be privacy-conscious: users must opt in, pause the system, delete posts, and avoid logging sensitive screenshot data. Automated redaction is deferred until after the MVP.

## 2. Vision

People already use productivity tools that reward focus. Uncognito does the opposite: it creates humorous social pressure by making distraction visible. The experience should feel like a hackathon-grade prank product with enough real engineering behind it to be credible in a demo.

The ideal demo moment:

1. A user enables the extension.
2. The extension waits for an unpredictable interval.
3. It captures the current browser tab.
4. The backend creates a roast from the screenshot.
5. A public roast page appears with a screenshot, caption, timestamp, and share-ready Open Graph metadata.
6. The audience sees the entry appear on the "Wall of Shame" or in a configured social channel.

## 3. Problem Statement

In a world of performative productivity, people can privately procrastinate while publicly claiming focus. Existing blockers and timers are easy to ignore because the consequences are private. Uncognito introduces a high-stakes, humorous feedback loop: if a user opts in, their browser behavior may become public content at any time.

The product is not meant to be a serious employee-monitoring tool. It is a voluntary, self-directed accountability stunt that uses randomness, AI, and social embarrassment as the core mechanic.

## 4. Target Users

### 4.1 Primary User

**Hackathon participant, student, indie builder, or remote worker** who wants a funny way to gamify focus and create shareable content.

Needs:

- A fast setup path.
- Clear control over when the system is active.
- Funny output that is worth sharing.
- Confidence that sensitive information is not accidentally exposed.

### 4.2 Demo Audience

**Judges, friends, teammates, or viewers** who encounter the public roast page.

Needs:

- Immediate understanding of the joke.
- A visually clear roast card.
- Proof that the system actually captured and generated the post.
- A simple way to browse previous roasts.

### 4.3 Non-Target Users

- Employers monitoring employees.
- Parents monitoring children.
- Silent or non-consensual surveillance use cases.
- Serious compliance, HR, or productivity analytics teams.

## 5. Goals and Non-Goals

### 5.1 Goals

- Build a demoable browser-extension-to-web flow in hackathon time.
- Capture screenshots on a randomized schedule using a Poisson process.
- Generate roast captions using an AI vision model.
- Store each roast with an image URL, caption, timestamp, and status.
- Render a public roast page with Open Graph metadata for link previews.
- Provide a Wall of Shame gallery.
- Include basic safety controls: enable/disable, delete, rate limits, and no raw screenshot logging.

### 5.2 Non-Goals

- No hidden monitoring.
- No multi-user enterprise admin dashboard.
- No browser history analysis beyond captured screenshots.
- No automated screenshot redaction in the hackathon MVP.
- No complex social scheduling or analytics.
- No native mobile app.
- No paid billing system.

## 6. MVP Scope

### 6.1 Must Have

- Chrome-compatible Manifest V3 browser extension.
- Extension enable/disable toggle.
- Randomized capture interval based on an exponential distribution.
- Visible-tab screenshot capture.
- Upload endpoint that receives screenshot data.
- Screenshot image hosting through Supabase Storage.
- AI-generated roast caption.
- Supabase-backed persistence.
- Public roast detail page at `/roast/[id]`.
- Open Graph metadata for roast pages.
- Wall of Shame gallery.
- Manual delete or hide action for a roast.
- Rate limit to prevent runaway posting.

### 6.2 Should Have

- Local extension settings for intensity level.
- Manual "Roast me now" button for demo reliability.
- Manual "Screenshot + LinkedIn Link" action for demo sharing.
- Demo mode with short capture intervals.
- Share button that copies the roast URL.
- Status indicators for last capture and next scheduled capture.
- A simple admin or owner view for hiding entries.
- Fallback roast text if AI generation fails.

### 6.3 Could Have

- Roast tone selector.
- Blur controls on the portal.
- Leaderboard for multiple users.
- Screenshot approval queue before public posting.

### 6.4 Out of Scope for Hackathon MVP

- Official LinkedIn API publishing.
- Automated screenshot redaction or sophisticated computer-vision PII detection.
- Payment or subscription plans.
- Organization workspaces.
- Mobile browser support.
- Long-term moderation tooling.

## 7. Success Metrics

### 7.1 Demo Success

- A judge can enable the extension and see a roast appear within 60 seconds in demo mode.
- A roast detail page renders correctly when opened directly.
- A social preview debugger or messaging app can read the page metadata.
- The Wall of Shame updates after a new roast is created.
- The system can survive at least five consecutive captures without crashing.

### 7.2 Product Quality Metrics

- Roast generation succeeds for at least 80% of submitted screenshots.
- Screenshot upload plus page creation completes in under 10 seconds for typical images.
- No more than one post is created per configured rate-limit window.
- Manual deletion or hiding takes effect immediately in the public gallery.
- The system avoids raw screenshot logging and supports immediate hide/delete for bad captures.

## 8. User Experience

### 8.1 Extension Experience

The extension should feel simple and slightly dangerous without being confusing.

Primary controls:

- Enable or disable Uncognito.
- Choose intensity: low, medium, high, or demo.
- Trigger a manual roast for demos.
- Trigger a manual screenshot plus LinkedIn share link for demos.
- See last capture status.
- See next capture estimate when available.

Important states:

- Disabled.
- Enabled and waiting.
- Capturing.
- Uploading.
- Roast created.
- Error with retry guidance.
- Rate-limited.

### 8.2 Web Portal Experience

The portal should make the joke understandable immediately. It should show:

- Latest public roast.
- Wall of Shame grid.
- Individual roast detail page.
- Timestamp and optional source context.
- Share/copy action.
- Hide/delete action for the owner.

The visual tone should be bold, cheeky, and fast to understand. It should not look like a serious surveillance product.

### 8.3 Social Sharing Experience

For the MVP, social sharing can be link-based instead of fully automated. The roast page must be share-ready with:

- `og:title`
- `og:description`
- `og:image`
- `og:url`
- `twitter:card`

LinkedIn is represented through a share URL unless API access is already available. Automated posting to other platforms is not included in the MVP.

## 9. Core User Flows

### 9.1 First-Time Setup

1. User installs the extension.
2. User opens extension popup.
3. User connects or enters the backend URL if needed.
4. User reviews the consent warning.
5. User enables Uncognito.
6. Extension schedules the first random capture.

### 9.2 Random Roast Flow

1. Extension alarm fires.
2. Extension checks whether capture is enabled.
3. Extension captures the visible tab.
4. Extension uploads the screenshot.
5. Backend stores the image.
6. Backend asks the AI model for a roast caption.
7. Backend writes a roast record.
8. Portal renders the new roast page.
9. Optional social channel receives the link.
10. Extension schedules the next random capture.

### 9.3 Manual Demo Roast Flow

1. User clicks "Roast me now."
2. Extension captures the current tab immediately.
3. Backend generates a roast.
4. Extension displays the created roast URL.
5. User opens or shares the result.

### 9.4 Manual Screenshot + LinkedIn Link Demo Flow

1. User clicks "Screenshot + LinkedIn Link."
2. Extension captures the current tab immediately with `captureMode: "demo_linkedin_link"`.
3. Backend generates a roast and public roast URL.
4. Social sharing logic prepares a LinkedIn share URL.
5. Extension displays the roast URL and LinkedIn share URL for manual demo sharing.

### 9.5 Delete or Hide Flow

1. User opens the roast page or owner dashboard.
2. User chooses hide/delete.
3. Backend marks the roast as hidden or deletes it.
4. Public pages stop displaying the entry.
5. If hard delete is supported, image storage deletion is attempted.

## 10. Functional Requirements

### 10.1 Browser Extension: "The Scout"

Requirements:

- Use Manifest V3.
- Provide a popup UI with enable/disable, intensity, and manual capture controls.
- Store settings in `chrome.storage.local`.
- Use `chrome.alarms` to schedule randomized captures.
- Use `chrome.tabs.captureVisibleTab` for screenshots.
- Prevent capture when the active tab is a restricted Chrome page.
- Prevent overlapping uploads if a previous capture is still processing.
- Show a clear error state when permissions or network calls fail.
- Schedule the next capture after each successful capture, skipped capture, or recoverable error.

Permissions:

- `activeTab`
- `tabs` if needed for tab metadata.
- `storage`
- `alarms`
- Host permission for the backend API.

### 10.2 Random Trigger Model

The capture process uses an unpredictable interrupt model based on a Poisson process. Inter-arrival times follow an exponential distribution:

```text
T_next = -ln(U) / lambda
```

Where:

- `U` is a random number between 0 and 1.
- `lambda` is the average capture rate per unit of time.
- Higher `lambda` means more frequent captures.

Suggested intensity presets:

| Intensity | Mean Interval | Intended Use |
| --- | ---: | --- |
| Low | 60 minutes | Realistic personal use |
| Medium | 30 minutes | Strong accountability |
| High | 10 minutes | Chaotic mode |
| Demo | 30-60 seconds | Hackathon presentation |

The extension should clamp values to prevent abusive or accidental rapid capture.

### 10.3 Backend API: "The Judge"

Primary endpoint:

```text
POST /api/upload
```

Responsibilities:

- Validate request body and content type.
- Enforce rate limits.
- Accept screenshot data.
- Upload the image to Supabase Storage.
- Generate a roast caption.
- Persist the roast record.
- Return the created roast ID and public URL.

Secondary endpoints:

```text
GET /api/roasts
GET /api/roasts/:id
PATCH /api/roasts/:id
DELETE /api/roasts/:id
POST /api/share/:id
```

`POST /api/share/:id` is optional for the MVP unless a social provider is configured.

### 10.4 AI Roast Generation

The AI should:

- Inspect the screenshot content.
- Identify the likely procrastination context.
- Generate a short roast suitable for a public card.
- Avoid slurs, protected-class insults, threats, sexual content, or doxxing.
- Avoid exposing sensitive text found in the screenshot.
- Keep captions punchy and shareable.

Caption constraints:

- 1-2 sentences.
- Maximum 220 characters for preview compatibility.
- Tone: sarcastic, clever, and theatrical.
- No direct repetition of secrets, emails, long numbers, addresses, or tokens.

Example prompt intent:

```text
You are writing a playful productivity roast for a consenting user.
Describe what the screenshot suggests they are doing, then make a short joke.
Do not reveal private data, credentials, personal identifiers, or sensitive text.
Keep it under 220 characters.
```

### 10.5 Deferred Redaction and Active Privacy Controls

Automated screenshot redaction is deferred until after the hackathon MVP. The MVP must not claim that screenshots are redacted before display.

Future redaction targets:

- Email addresses.
- Phone-number-like strings.
- Credit-card-like strings.
- Password or token fields.
- API-key-like strings.
- Long numeric identifiers.

Future implementation options:

- Extension-side DOM-aware masking before capture for visible inputs where possible.
- Backend image redaction for obvious OCR-detected patterns if OCR is available.

Active MVP privacy controls:

- Extension starts disabled and requires explicit opt-in.
- UI states that screenshots can become public.
- Backend avoids logging raw screenshots, raw base64, and full prompts.
- AI prompt and validation avoid quoting private text from screenshots.
- Owner hide/delete controls exist as the final safety net.

### 10.6 Web Portal: "The Vault"

Pages:

- `/` - Wall of Shame gallery.
- `/roast/[id]` - Public detail page.
- `/admin` or protected owner view - optional for managing entries.

Requirements:

- Server-render dynamic metadata for each roast.
- Show screenshot, caption, timestamp, and share action.
- Exclude hidden roasts from public views.
- Provide a loading or not-found state.
- Use an image fallback if the hosted image is unavailable.
- Keep the page readable on mobile and desktop.

### 10.7 Social Sharing

MVP:

- Copy/share roast link.
- Ensure Open Graph metadata works.

LinkedIn handling:

- Provide a LinkedIn share URL or manual copy flow.
- The demo may expose a "Screenshot + LinkedIn Link" action that creates a roast and returns a LinkedIn share URL.
- Official LinkedIn API integration is stretch because API permissions are unpredictable in hackathon time.

## 11. Data Model

### 11.1 Roast

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | Yes | Public-safe unique ID |
| `imageUrl` | string | Yes | Hosted image URL |
| `caption` | string | Yes | AI-generated roast |
| `status` | string | Yes | `processing`, `public`, `hidden`, `failed`, or `deleted` |
| `createdAt` | datetime | Yes | Capture creation time |
| `updatedAt` | datetime | Yes | Last state change |
| `sourceHost` | string | No | Domain of active tab, if collected |
| `sourceTitle` | string | No | Tab title, if collected |
| `themes` | JSON | No | AI themes used for variety |
| `shareStatus` | string | No | `not_shared`, `link_ready`, `shared`, or `failed` |
| `errorReason` | string | No | Stored only for failed records |

### 11.2 Settings

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `enabled` | boolean | Yes | Extension capture state |
| `intensity` | string | Yes | `low`, `medium`, `high`, or `demo` |
| `backendUrl` | string | Yes | API base URL |
| `lastCaptureAt` | datetime | No | Local status display |
| `nextCaptureAt` | datetime | No | Local status display |

## 12. API Contracts

### 12.1 Upload Request

```json
{
  "imageBase64": "data:image/png;base64,...",
  "sourceHost": "example.com",
  "sourceTitle": "Optional tab title",
  "captureMode": "random",
  "clientTimestamp": "2026-05-02T10:00:00.000Z"
}
```

`captureMode` may be `random`, `manual`, or `demo_linkedin_link`.

### 12.2 Upload Response

```json
{
  "id": "rst_123",
  "caption": "Three tabs deep into distraction and somehow still calling it research.",
  "imageUrl": "https://dgsqalakuycjxdnsdrnl.supabase.co/storage/v1/object/public/roast-images/roasts/rst_123/capture.png",
  "publicUrl": "https://uncognito.example/roast/rst_123",
  "shareStatus": "not_shared",
  "createdAt": "2026-05-02T10:00:02.000Z"
}
```

When `captureMode` is `demo_linkedin_link`, the response may also include:

```json
{
  "shareStatus": "link_ready",
  "linkedInShareUrl": "https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Funcognito.example%2Froast%2Frst_123"
}
```

### 12.3 Error Response

```json
{
  "error": "RATE_LIMITED",
  "message": "Too many captures. Try again later.",
  "retryAfterSeconds": 300
}
```

## 13. Technical Architecture

### 13.1 Recommended Hackathon Stack

| Component | Recommended Technology | Notes |
| --- | --- | --- |
| Web app | Next.js | App Router or Pages Router are both acceptable |
| Hosting | Vercel | Simple deploy and dynamic metadata support |
| Database | Supabase Postgres | Hosted Postgres for deployed demo persistence |
| Extension | Manifest V3, JavaScript or React | Keep popup small |
| Image hosting | Supabase Storage | Stable public image URLs for Open Graph previews |
| AI | Configurable OpenAI vision-capable model | Use env var for model selection |
| Social | Manual share and LinkedIn share-link demo flow | Prefer reliable setup over LinkedIn automation |

### 13.2 System Flow

```text
Browser Extension
  -> capture visible tab
  -> send screenshot to /api/upload
Backend API
  -> validate and rate limit
  -> upload image to Supabase Storage
  -> generate roast caption with AI
  -> persist roast record
  -> optionally share link
Web Portal
  -> render Wall of Shame
  -> render /roast/[id] with dynamic metadata
Social Preview Crawler
  -> reads OG tags from /roast/[id]
```

### 13.3 Environment Variables

Expected variables:

```text
SUPABASE_URL=https://dgsqalakuycjxdnsdrnl.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_swa3MqwbsGNDQpYaiG9wGw_urwihpaa
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=roast-images
OPENAI_API_KEY=
OPENAI_VISION_MODEL=
PUBLIC_APP_URL=
ADMIN_TOKEN=
```

`SUPABASE_SERVICE_ROLE_KEY` is required for backend writes, object deletion, and owner hide/delete flows. It must never be exposed to frontend code.

## 14. Security, Privacy, and Safety

### 14.1 Consent

- The extension must be disabled by default.
- The user must explicitly enable capture.
- The UI must make clear that screenshots can become public.
- Demo mode must be visibly labeled.

### 14.2 Data Handling

- Do not collect full browser history.
- Do not collect cookies.
- Do not collect page HTML.
- Do not store raw base64 after image upload succeeds.
- Hide or delete roasts on user request.
- Avoid logging screenshot data or full AI prompts in server logs.

### 14.3 Abuse Prevention

- Rate-limit upload requests.
- Require an admin token or owner secret for destructive actions.
- Avoid making the product useful for non-consensual monitoring.
- Keep automated social posting disabled unless explicitly configured.

### 14.4 AI Safety

- Do not generate hateful or protected-class insults.
- Do not quote private data from screenshots.
- Provide fallback caption if generation fails or is blocked.
- Keep tone playful rather than abusive.

## 15. Edge Cases and Failure Handling

| Case | Expected Behavior |
| --- | --- |
| Restricted browser page | Skip capture and schedule next attempt |
| Extension disabled during alarm | Do nothing |
| Network failure | Show error, retry manually, schedule next capture |
| Image upload fails | Return error and do not create public roast |
| AI generation fails | Use fallback caption or mark record failed |
| Database write fails | Do not share link; surface error |
| Rate limit hit | Return retry time and schedule later capture |
| Screenshot contains sensitive data | Do not log raw data; allow immediate hide/delete; redaction is future work |
| Social posting fails | Keep roast page available and mark share failed |
| OG crawler caches old metadata | Provide clear page content even if preview is stale |

## 16. Testing Plan

### 16.1 Extension Tests

- Toggle persists across popup close/open.
- Random interval function returns values inside configured bounds.
- Manual capture calls upload endpoint.
- Capture is skipped on restricted pages.
- Duplicate upload prevention works.

### 16.2 Backend Tests

- Upload rejects invalid payloads.
- Upload enforces rate limits.
- Successful upload creates a roast record.
- AI failure produces fallback behavior.
- Hidden roasts are excluded from public list.
- Delete or hide endpoint requires authorization.

### 16.3 Web Tests

- Wall of Shame renders empty and populated states.
- Roast detail page renders valid data.
- Missing roast returns a not-found state.
- Hidden roast is not publicly visible.
- Metadata includes title, description, image, and URL.

### 16.4 Demo Tests

- Demo mode can produce a roast within 60 seconds.
- Manual roast flow works from extension to portal.
- Manual Screenshot + LinkedIn Link flow returns a roast URL and LinkedIn share URL.
- Public URL opens on a clean browser session.
- Social preview can read metadata.

## 17. Hackathon Delivery Plan

### Phase 1: Skeleton

- Create Next.js app.
- Create basic database schema.
- Add `/api/upload`.
- Add Wall of Shame and roast detail pages.

### Phase 2: Extension

- Build Manifest V3 extension.
- Add popup controls.
- Implement manual capture.
- Implement randomized scheduling.

### Phase 3: AI and Storage

- Wire image hosting.
- Wire AI roast generation.
- Store records and render public pages.
- Add fallback behavior.

### Phase 4: Safety and Polish

- Add rate limiting.
- Add hide/delete.
- Add Open Graph metadata.
- Add share/copy flow.

### Phase 5: Demo Prep

- Enable demo mode.
- Seed a few example roasts if needed.
- Verify deployed URLs.
- Prepare a short live demo script.

## 18. Demo Script

1. Open the Uncognito portal and show an empty or existing Wall of Shame.
2. Open the extension popup and enable demo mode.
3. Click "Roast me now" for a deterministic demo path.
4. Show the backend processing state or extension success state.
5. Open the generated roast page.
6. Copy or share the URL.
7. Show the Wall of Shame updated with the new entry.
8. Hide/delete the entry to demonstrate user control.
9. Explain that the real mode uses a Poisson process so the timing is unpredictable.

## 19. Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| LinkedIn API access is difficult | Demo may fail | Use a manual LinkedIn share link first |
| Screenshot leaks sensitive data | User trust issue | Opt-in, prompt safety, no raw logging, delete/hide; automated redaction is future work |
| AI output is weak | Joke falls flat | Add prompt constraints and fallback captions |
| Extension permissions are confusing | Setup friction | Keep permissions minimal and explain consent |
| Vercel statelessness complicates storage | Lost records | Use Supabase Postgres and Supabase Storage |
| Supabase Storage upload fails | Broken pages | Mark the roast failed, avoid publishing, and use local/mock storage during development |
| OG preview caching is slow | Demo inconsistency | Show public page directly and test preview ahead of time |

## 20. Hackathon Implementation Decisions

- **Publishing model:** Roasts publish immediately after upload because explicit opt-in is part of setup. Approval queue is a future enhancement.
- **Social channel:** Manual link sharing is the guaranteed MVP path.
- **Owner controls:** Hide/delete actions require an `ADMIN_TOKEN` for the hackathon version.
- **Repository shape:** Use one monorepo containing the web app, API routes, shared types, and extension package.
- **Local demo fallback:** Local/mock image storage is acceptable for development, but the deployed demo should use Supabase Storage public URLs so Open Graph previews work.

## 21. Future Enhancements

- Approval queue before publishing.
- Multi-user accounts.
- Team rooms and leaderboards.
- Roast tone presets.
- Browser allowlist or blocklist.
- Strong OCR-based redaction.
- Scheduled recap posts.
- Shareable streaks and focus scores.
- Browser activity categories.
- More social integrations.

## 22. Acceptance Criteria

The MVP is complete when:

- A user can enable the extension.
- The extension can capture a visible browser tab.
- The screenshot can be uploaded to the backend.
- The backend can create a roast record with hosted image and caption.
- The portal can render the roast detail page.
- The Wall of Shame lists public roasts.
- The roast page exposes valid Open Graph metadata.
- The user can hide or delete a roast.
- The demo mode can reliably create a roast during a live presentation.

## 23. Project Summary

Uncognito bridges computer vision, randomized scheduling, and social accountability into a compact hackathon product. The Poisson-distributed trigger creates the feeling that a capture could happen at any time, while the portal turns each capture into a shareable public artifact.

The hackathon version should not chase full social automation or enterprise polish. It should prove the loop: opt in, capture unpredictably, generate a funny roast, publish a shareable page, and keep enough user control to make the chaos feel intentional rather than reckless.
