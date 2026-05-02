# Backend Judge Agent

## Mission

Own the backend upload pipeline that validates screenshots, coordinates image hosting and AI generation, persists roast records, and returns public URLs.

## Owns

- `/api/upload`
- `/api/roasts`
- `/api/roasts/:id`
- `/api/share/:id` if implemented.
- Request validation.
- Rate limiting.
- Error response shape.
- Server-side orchestration.

## Does Not Own

- Extension UI.
- Random interval math.
- Final AI prompt tuning.
- Portal visual design.
- Social provider implementation details.

## Inputs

- Upload request from Extension Scout Agent.
- Data model from Data Storage Agent.
- Supabase storage adapter from Data Storage Agent.
- Caption function from AI Roast Agent.
- Share action contract from Social Sharing Agent when demo sharing is enabled.

## Required Outputs

- A validated upload endpoint.
- A persisted roast record with `id`, `imageUrl`, `caption`, `status`, and timestamps.
- Standardized success and error responses.
- Hidden/deleted states respected by read endpoints.

## API Contract

### Upload Request

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

### Upload Response

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

For `captureMode: "demo_linkedin_link"`, the response may also include `shareStatus: "link_ready"` and `linkedInShareUrl`.

### Error Response

```json
{
  "error": "RATE_LIMITED",
  "message": "Too many captures. Try again later.",
  "retryAfterSeconds": 300
}
```

## Failure Policy

- Invalid payload: reject with a client error.
- Rate limit hit: reject with `retryAfterSeconds`.
- Image upload failure: do not create a public roast.
- AI failure: use fallback caption or create a failed record based on implementation status.
- Database write failure: do not share a link.
- Social share failure: keep the roast page available and mark sharing failed.

## Industry Practices

- Validate all external input at the API boundary.
- Keep Supabase and provider calls behind service adapters.
- Avoid logging raw images or full prompts.
- Make operations idempotent where reasonable.
- Return stable error codes that clients can branch on.

## Collaboration Contracts

- **Consumes:** storage and image APIs from Data Storage Agent.
- **Consumes:** `generateRoastCaption` contract from AI Roast Agent.
- **Consumes:** optional share trigger contract from Social Sharing Agent.
- **Produces:** API response contracts for Extension Scout Agent and Web Vault Agent.

## Testing Checklist

- Invalid payloads are rejected.
- Rate limits are enforced.
- Successful upload creates a public roast.
- AI failure returns fallback behavior.
- Hidden roasts are excluded from public list responses.
- Hide/delete requires authorization.
- `demo_linkedin_link` capture mode can create a roast and return a LinkedIn share URL without requiring LinkedIn API access.

## Definition of Done

- The manual extension flow can create a persisted public roast.
- API errors are predictable and documented.
- No raw base64 is stored after successful image upload.
- Public URL generation uses `PUBLIC_APP_URL`.
