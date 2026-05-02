# Random Trigger Agent

## Mission

Implement the unpredictable capture cadence using a Poisson process while keeping demo mode reliable and rate limits respected.

## Owns

- Exponential-distribution interval calculation.
- Intensity presets.
- Interval clamping.
- Scheduling contract with `chrome.alarms`.
- Demo-mode timing.
- Tests for random interval behavior.

## Does Not Own

- Screenshot capture implementation.
- Upload endpoint implementation.
- Backend rate-limit enforcement.
- UI styling.

## Inputs

- Intensity selected by the extension user.
- PRD intensity presets.
- Backend rate-limit policy.

## Required Outputs

- A pure function that returns the next interval for an intensity.
- Presets for low, medium, high, and demo modes.
- Minimum and maximum clamps to prevent runaway behavior.
- A scheduling policy that avoids immediate rescheduling loops.

## Functional Requirements

Use:

```text
T_next = -ln(U) / lambda
```

Where `U` is a random number between 0 and 1 and `lambda` is the average capture rate.

Suggested mean intervals:

- Low: 60 minutes.
- Medium: 30 minutes.
- High: 10 minutes.
- Demo: 30-60 seconds.

## Industry Practices

- Keep the random interval generator pure and testable.
- Inject randomness in tests instead of relying on real random values.
- Clamp output to safe operational bounds.
- Separate demo reliability from real-use randomness.
- Document units explicitly.

## Collaboration Contracts

- **Produces:** `getNextCaptureDelay(intensity)` or equivalent.
- **Consumes:** backend `retryAfterSeconds` values for rate-limited uploads.
- **Hands off to Extension Scout Agent:** delay in milliseconds or minutes, depending on chosen implementation.

## Testing Checklist

- Fixed `U` values produce deterministic intervals.
- Each intensity maps to the expected mean interval.
- Returned values are clamped.
- Demo mode never exceeds the live-demo target window.
- Rate-limit retry values override random scheduling when present.

## Definition of Done

- Extension scheduling is unpredictable in normal modes.
- Demo mode remains predictable enough for a live presentation.
- The scheduling logic cannot create a capture storm.
