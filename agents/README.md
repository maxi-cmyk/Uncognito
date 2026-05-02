# Uncognito Agent System

This folder translates the PRD into focused implementation agents. Each agent owns one bounded function, works from the PRD as source of truth, and hands off through explicit contracts.

## Operating Principles

- **Single clear owner:** Every functional area has one accountable agent.
- **Small blast radius:** Agents edit only files in their ownership area unless a handoff requires coordination.
- **Contract-first collaboration:** Shared data models, API payloads, environment variables, and route names must be agreed before dependent implementation work.
- **Explicit control first:** Any screenshot, roast, or social-sharing behavior must preserve opt-in, rate limits, hide/delete controls, and clear demo-only actions.
- **Demo reliability:** Manual demo paths are first-class. Randomized behavior must not make the hackathon demo fragile.
- **No hidden surveillance:** Agents must not add functionality that enables silent monitoring, employee tracking, browser-history scraping, cookie capture, or non-consensual use.

## Agent Roster

| Agent | Function | Primary PRD Sections |
| --- | --- | --- |
| [Product Orchestrator](./product-orchestrator.md) | Scope, sequencing, cross-agent decisions | 5, 6, 17, 22 |
| [Extension Scout Agent](./extension-scout.md) | Browser extension capture UX | 8.1, 9.1-9.4, 10.1 |
| [Random Trigger Agent](./random-trigger.md) | Poisson scheduling and capture cadence | 10.2 |
| [Backend Judge Agent](./backend-judge.md) | API orchestration and upload flow | 9.2, 10.3, 12 |
| [AI Roast Agent](./ai-roast-generator.md) | Vision prompt, caption quality, fallback roasts | 10.4, 14.4 |
| [Web Vault Agent](./web-vault.md) | Portal, roast pages, Open Graph metadata | 8.2, 10.6 |
| [Social Sharing Agent](./social-sharing.md) | Copy/share, LinkedIn share-link demo flow, social preview reliability | 8.3, 9.4, 10.7 |
| [Data Storage Agent](./data-storage.md) | Supabase schema, persistence, and screenshot storage | 11, 13 |
| [QA Demo Agent](./qa-demo.md) | Verification, acceptance criteria, demo readiness | 7, 15, 16, 18, 22 |

## Handoff Protocol

When an agent depends on another agent, it should produce or request a small written contract:

- **Owner:** Which agent owns the contract.
- **Interface:** API route, function signature, schema, environment variable, or UI state.
- **Inputs:** Required fields, validation rules, and failure cases.
- **Outputs:** Response shape, status values, side effects, and errors.
- **Acceptance checks:** How another agent can verify the contract works.

## Recommended Build Order

1. Product Orchestrator locks MVP sequencing and confirms default decisions.
2. Data Storage Agent defines schema and storage adapters.
3. Backend Judge Agent defines API contracts around that schema.
4. Web Vault Agent renders stored records.
5. Extension Scout Agent implements manual capture against the API.
6. Random Trigger Agent adds scheduling after manual capture works.
7. AI Roast Agent adds real caption generation and fallbacks.
8. Social Sharing Agent adds share links, the manual LinkedIn share-link demo path, or webhook posting.
9. QA Demo Agent verifies the full live demo path.

## Definition of Done for Any Agent

- The implementation matches the PRD and this agent brief.
- Public behavior is covered by focused tests or a documented manual verification path.
- Error states are handled and user-visible where relevant.
- Sensitive data is not logged unnecessarily.
- Environment variables are documented when added.
- Cross-agent contracts are updated if changed.
- Demo mode remains reliable.

## Deferred Privacy Work

Screenshot redaction, OCR-based masking, and broader privacy automation are intentionally out of the active MVP. Agents should not block the demo on redaction features, but they must still avoid silent monitoring, raw screenshot logging, cookie capture, and browser-history collection.
