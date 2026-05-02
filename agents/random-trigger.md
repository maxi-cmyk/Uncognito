# Random Trigger Agent

## Mission

Design and implement Uncognito's unpredictable capture cadence using the PRD's Poisson process while keeping demo mode reliable, Chrome alarm behavior respected, and backend rate limits authoritative.

The random trigger exists to make capture timing impossible to predict in normal use. It must never create a capture storm, interfere with manual demo actions, or make the live hackathon demo depend on waiting for a random event.

## Owns

- Exponential-distribution interval calculation.
- Intensity presets and units.
- Interval clamping.
- One-shot scheduling contract with `chrome.alarms`.
- Demo-mode timing.
- Rate-limit retry override.
- Alarm reconciliation after extension startup.
- Deterministic tests for interval behavior.

## Does Not Own

- Screenshot capture implementation.
- Upload endpoint implementation.
- Backend rate-limit enforcement.
- Extension popup styling.
- Manual "Roast me now" flow.
- Manual "Screenshot + LinkedIn Link" flow.

## Source Documents

- `docs/PRD.md`, sections 8.1, 9.1, 9.2, 10.1, 10.2, 15, 16.1, and 16.4.
- `agents/extension-scout.md`
- `agents/backend-judge.md`
- `agents/qa-demo.md`

## Product Requirements From PRD

- Use `chrome.alarms` for randomized captures.
- Use an unpredictable interrupt model based on a Poisson process.
- Inter-arrival times follow an exponential distribution:

```text
T_next = -ln(U) / lambda
```

- `U` is a random number between 0 and 1.
- `lambda` is the average capture rate per unit of time.
- Higher `lambda` means more frequent captures.
- Schedule the next capture after each successful capture, skipped capture, or recoverable error.
- Rate-limit responses must delay the next attempt.
- Demo mode must be able to produce a roast within 60 seconds.

## Design Decision

Use a pure random-trigger package that returns delays in milliseconds, then let the extension convert that delay to Chrome alarm minutes.

The package should not call browser APIs directly. It should only calculate the next delay, normalize capture outcomes, and expose the metadata the Extension Scout Agent needs to create or clear one named alarm.

## Intensity Presets

| Intensity | Mean | Minimum Clamp | Maximum Clamp | Use |
| --- | ---: | ---: | ---: | --- |
| `low` | 60 min | 10 min | 180 min | Realistic personal use |
| `medium` | 30 min | 5 min | 90 min | Strong accountability |
| `high` | 10 min | 2 min | 30 min | Chaotic mode |
| `demo` | 45 sec | 30 sec | 60 sec | Hackathon presentation |

The means come from the PRD. The clamp bounds are implementation safeguards: normal modes stay random but cannot create extreme immediate repeats or multi-day waits; demo mode satisfies the live-demo requirement.

## Chrome Alarm Contract

Chrome alarms should be one-shot alarms, not repeating alarms. Each alarm fire should produce one capture attempt, then sample a new interval.

Alarm name:

```text
uncognito.random-capture
```

Handoff shape:

```ts
type AlarmSchedule = {
  alarmName: "uncognito.random-capture";
  delayMs: number;
  delayInMinutes: number;
  scheduledFor: string;
  reason: "initial" | "success" | "skipped" | "recoverable_error" | "rate_limited" | "startup_reconcile";
};
```

Chrome currently enforces a 30-second minimum for extension alarms in normal installed extensions. The scheduler should clamp `delayInMinutes` to at least `0.5` before calling `chrome.alarms.create`.

## Public Package Contract

```ts
type Intensity = "low" | "medium" | "high" | "demo";

type CaptureOutcome =
  | { type: "success" }
  | { type: "skipped"; reason: "restricted_page" | "disabled" | "upload_in_flight" }
  | { type: "recoverable_error"; code: string }
  | { type: "rate_limited"; retryAfterSeconds: number };

type RandomSource = () => number;

type NextDelayInput = {
  intensity: Intensity;
  random?: RandomSource;
};

type NextScheduleInput = {
  intensity: Intensity;
  outcome: CaptureOutcome;
  nowMs?: number;
  random?: RandomSource;
};
```

Required functions:

```ts
getIntensityPreset(intensity: Intensity): IntensityPreset;
sampleExponentialDelayMs(input: NextDelayInput): number;
clampDelayMs(delayMs: number, preset: IntensityPreset): number;
getNextCaptureDelayMs(input: NextDelayInput): number;
getNextSchedule(input: NextScheduleInput): AlarmSchedule;
toChromeDelayInMinutes(delayMs: number): number;
```

## Math Policy

For each intensity:

```text
lambda = 1 / meanMs
rawDelayMs = -ln(U) / lambda
delayMs = clamp(rawDelayMs, minMs, maxMs)
```

Random input policy:

- Accept injected `random` for deterministic tests.
- Default to `Math.random` at runtime.
- Clamp `U` away from exactly `0` and `1` to avoid `Infinity` and zero-delay edge cases.
- Treat all internal time values as milliseconds.
- Convert to minutes only at the Chrome alarm boundary.

## Scheduling Policy

### Enable Flow

When the user enables Uncognito:

1. Read selected intensity.
2. Clear any existing `uncognito.random-capture` alarm.
3. Sample a delay using `getNextSchedule({ reason: "initial" })`.
4. Store `nextCaptureAt`.
5. Create the one-shot alarm.

### Alarm Fire Flow

When the alarm fires:

1. Confirm Uncognito is still enabled.
2. If disabled, clear `nextCaptureAt` and do not reschedule.
3. If enabled, run the capture flow owned by Extension Scout Agent.
4. Convert the capture result to a `CaptureOutcome`.
5. Schedule the next one-shot alarm from that outcome.

### Rate-Limited Flow

If the backend returns `retryAfterSeconds`, this value overrides random sampling:

```text
delayMs = max(retryAfterSeconds * 1000, chromeMinimumDelayMs)
```

The scheduler should mark the reason as `rate_limited` so the extension can show retry guidance.

### Manual Demo Flows

Manual "Roast me now" and "Screenshot + LinkedIn Link" bypass the random trigger. They should not clear, replace, or resample the active random alarm unless the user explicitly toggles Uncognito on/off.

### Startup Reconciliation

On extension startup:

- If Uncognito is disabled, clear the random alarm.
- If Uncognito is enabled and no random alarm exists, schedule a new one with reason `startup_reconcile`.
- If `nextCaptureAt` is in the past, schedule with the Chrome minimum delay instead of firing immediately.

## Error Handling

| Case | Scheduler behavior |
| --- | --- |
| Extension disabled | Clear alarm and do not reschedule |
| Restricted page | Schedule next random delay with reason `skipped` |
| Upload in flight | Schedule next random delay with reason `skipped` |
| Recoverable upload/network error | Schedule next random delay with reason `recoverable_error` |
| Backend rate limit | Use `retryAfterSeconds` override |
| Invalid intensity | Fall back to `medium` and log a non-sensitive warning |
| Invalid random value | Clamp into valid open interval |
| Alarm create failure | Surface extension error and do not loop |

## Collaboration Contracts

- **Extension Scout Agent:** consumes `AlarmSchedule`, owns `chrome.alarms.create`, alarm listeners, storage persistence, and user-visible status.
- **Backend Judge Agent:** provides `retryAfterSeconds` for rate-limited upload responses.
- **QA Demo Agent:** verifies demo mode creates a roast within 60 seconds and manual demo flows do not depend on random timing.

## Testing Checklist

- Fixed `U` values produce deterministic raw exponential delays.
- Each intensity maps to the expected PRD mean.
- Returned delays are clamped by intensity.
- Demo mode always returns 30-60 seconds.
- Chrome alarm conversion never returns less than `0.5` minutes.
- `retryAfterSeconds` overrides random sampling.
- Disabled outcomes do not create a follow-up schedule.
- Startup reconciliation handles missing, past, and future alarms.
- Manual demo actions leave any existing random alarm untouched.

## Definition of Done

- Extension scheduling is unpredictable in normal modes.
- Demo mode remains reliable enough for a live presentation.
- The scheduling logic cannot create a capture storm.
- All random math is pure and deterministic under injected randomness.
- Chrome alarm API boundaries are isolated to the extension.
- Rate-limit recovery is controlled by backend `retryAfterSeconds`.
