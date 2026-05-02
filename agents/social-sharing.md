# Social Sharing Agent

## Mission

Make each roast easy to share, while keeping the guaranteed MVP path independent of fragile third-party social APIs.

## Owns

- Copy/share link behavior.
- Social metadata requirements.
- Optional Telegram or Discord webhook integration.
- Optional LinkedIn share URL.
- Demo-only LinkedIn share-link trigger contract.
- Share status tracking.

## Does Not Own

- Screenshot capture.
- Roast generation.
- Core storage schema except share fields.
- Public page rendering beyond metadata requirements.

## Inputs

- Public roast URL from Backend Judge Agent.
- Optional `demo_linkedin_link` capture mode from Extension Scout Agent through Backend Judge Agent.
- Metadata implementation from Web Vault Agent.
- Provider credentials from environment variables.
- Product decision that manual share is guaranteed MVP.

## Required Outputs

- Working copy/share path.
- Metadata checklist for Web Vault Agent.
- Optional webhook sender behind configuration.
- LinkedIn demo output: a LinkedIn share URL for the roast page.
- Predictable failure behavior when social provider calls fail.

## MVP Policy

- Manual link sharing is required.
- Screenshot + LinkedIn Link is a manual demo path, not background automation.
- Automated posting is optional.
- Telegram or Discord is preferred for hackathon automation.
- Official LinkedIn API integration is stretch.

## Environment Variables

```text
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
DISCORD_WEBHOOK_URL=
```

Only variables for enabled providers are required.

## Industry Practices

- Treat third-party social APIs as unreliable for live demos.
- Feature-detect configured providers instead of hard failing.
- Make social posting idempotent where possible.
- Keep provider-specific code isolated.
- Persist share failures without breaking public roast pages.

## Collaboration Contracts

- **Consumes:** public URL and roast caption from Backend Judge Agent.
- **Consumes:** metadata support from Web Vault Agent.
- **Produces:** `shareStatus`: `not_shared`, `link_ready`, `shared`, or `failed`.
- **Produces:** `linkedInShareUrl` for the manual demo path when requested.
- **Hands off failures to QA Demo Agent:** so demo path can avoid unreliable providers.

## Testing Checklist

- Copy link works without any provider credentials.
- Screenshot + LinkedIn Link returns a LinkedIn share URL without provider credentials.
- Missing webhook credentials do not break roast creation.
- Configured webhook sends a public roast URL.
- Social provider failure marks share failed but leaves roast visible.
- Link preview can read the public page metadata.

## Definition of Done

- The demo can share a roast through a reliable manual path.
- The demo can manually trigger a screenshot and LinkedIn share link on demand.
- Optional automation does not threaten the core upload-to-page flow.
- Share state is observable for debugging.
