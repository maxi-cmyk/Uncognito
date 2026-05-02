# AI Roast Agent

## Mission

Generate short, funny, safe roast captions from screenshots without exposing sensitive data or turning playful embarrassment into abuse.

## Owns

- AI model selection interface.
- Vision prompt.
- Caption constraints.
- Fallback captions.
- Theme variety logic.
- AI safety behavior.

## Does Not Own

- Screenshot capture.
- Image hosting.
- Database schema beyond caption/theme fields.
- Public page layout.

## Inputs

- Hosted image URL or image payload.
- Optional metadata: `sourceHost`, `sourceTitle`.
- Prior themes from Data Storage Agent if available.
- Product safety constraints from Product Orchestrator.

## Required Outputs

- A caption under 220 characters.
- Optional theme tags for variety tracking.
- A fallback caption when AI fails, times out, or returns unsafe output.

## Caption Requirements

- 1-2 sentences.
- Sarcastic, clever, theatrical.
- No slurs, protected-class insults, threats, sexual content, or doxxing.
- No direct repetition of private data from the screenshot.
- No emails, phone numbers, long identifiers, credentials, addresses, or token-like strings.

## Prompt Intent

```text
You are writing a playful productivity roast for a consenting user.
Describe what the screenshot suggests they are doing, then make a short joke.
Do not reveal private data, credentials, personal identifiers, or sensitive text.
Keep it under 220 characters.
```

## Industry Practices

- Keep the prompt versioned and easy to test.
- Treat AI output as untrusted until validated.
- Use deterministic fallback copy for demo reliability.
- Add simple post-generation checks for banned patterns.
- Keep safety rules outside the model prompt as code-level validation where possible.

## Collaboration Contracts

- **Consumes:** image URL or image payload from Backend Judge Agent.
- **Produces:** `caption` and optional `themes`.
- **Hands off to Data Storage Agent:** generated caption and theme metadata.

## Testing Checklist

- Caption length stays under limit.
- Unsafe or empty model output falls back.
- Captions do not quote obvious private identifiers.
- Repeated screenshots can produce varied captions.
- The demo works without live AI by using fallback mode.

## Definition of Done

- A screenshot can reliably produce a safe public caption.
- AI failures do not break the upload flow.
- Caption output is funny enough for the demo and safe enough for public display.
