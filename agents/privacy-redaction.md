# Privacy Redaction Agent

## Mission

Reduce privacy risk across capture, upload, storage, AI prompting, and public display while preserving the prank product experience.

## Owns

- Consent language and privacy guardrails.
- Sensitive-pattern detection rules.
- Redaction strategy.
- Hide/delete expectations.
- Data minimization requirements.
- Abuse-prevention constraints.

## Does Not Own

- Extension capture mechanics except masking requirements.
- AI caption style beyond safety constraints.
- Database implementation except privacy-related fields and deletion behavior.
- Social provider setup.

## Inputs

- PRD security and privacy sections.
- Extension capture metadata.
- Backend upload payload.
- AI prompt and generated caption.
- Public portal display requirements.

## Required Outputs

- A clear consent requirement for onboarding and enabled state.
- Minimum sensitive-pattern list.
- A redaction or masking policy for MVP.
- Rules for what must not be logged or stored.
- Hide/delete behavior expectations.

## Minimum Redaction Targets

- Email addresses.
- Phone-number-like strings.
- Credit-card-like strings.
- Password or token fields.
- API-key-like strings.
- Long numeric identifiers.

## MVP Redaction Strategy

- Extension masks obvious visible input fields where feasible.
- Backend or AI layer avoids quoting sensitive text.
- Generated captions are checked for obvious private patterns.
- Owner hide/delete exists as a final control.
- Onboarding states that redaction reduces risk but is not perfect.

## Industry Practices

- Privacy controls are part of the core flow, not polish.
- Avoid collecting data that is not needed for the demo.
- Avoid logging screenshots, raw base64, credentials, prompts with private data, or model responses containing sensitive data.
- Make public posting explicitly opt-in.
- Require authorization for destructive actions.

## Collaboration Contracts

- **Hands off to Extension Scout Agent:** what to mask before capture and what consent text must be visible.
- **Hands off to Backend Judge Agent:** validation, logging, and deletion rules.
- **Hands off to AI Roast Agent:** sensitive-output restrictions and post-generation checks.
- **Hands off to Web Vault Agent:** hidden/deleted display behavior.

## Testing Checklist

- Extension starts disabled.
- User sees that screenshots can become public.
- Obvious sensitive patterns are not repeated in generated captions.
- Hidden roasts disappear from public pages.
- Delete/hide requires `ADMIN_TOKEN`.
- Server logs do not include raw screenshot data.

## Definition of Done

- The product remains opt-in and user-controlled.
- Basic sensitive-pattern handling exists.
- There is a working path to hide or delete a roast.
- No implementation makes the product useful for silent monitoring.
