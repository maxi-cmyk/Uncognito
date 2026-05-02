# Random Trigger Service

The random-trigger service owns Uncognito's timing math. It implements the PRD's Poisson interrupt model as pure, testable functions that the browser extension can use to schedule one-shot Chrome alarms.

## Responsibilities

- Define intensity presets.
- Sample exponential inter-arrival delays.
- Clamp intervals to safe operational bounds.
- Convert milliseconds to Chrome alarm minutes.
- Respect backend `retryAfterSeconds` responses.
- Provide deterministic tests by accepting an injected random source.

## Presets

| Intensity | Mean | Minimum Clamp | Maximum Clamp |
| --- | ---: | ---: | ---: |
| `low` | 60 min | 10 min | 180 min |
| `medium` | 30 min | 5 min | 90 min |
| `high` | 10 min | 2 min | 30 min |
| `demo` | 45 sec | 30 sec | 60 sec |

The PRD defines the mean intervals. The clamps prevent runaway captures, unusably long waits, and unreliable demos.

## Formula

```text
T_next = -ln(U) / lambda
lambda = 1 / meanMs
```

The implementation should use milliseconds internally. Convert to minutes only when passing the result to `chrome.alarms.create`.

## Chrome Alarm Boundary

Use a single one-shot alarm:

```text
uncognito.random-capture
```

The extension owns the actual browser call. This package should return a schedule object with:

- `delayMs`
- `delayInMinutes`
- `scheduledFor`
- `reason`

Current Chrome extension alarms have a normal installed-extension minimum of 30 seconds, so `delayInMinutes` must never be less than `0.5`.

## Manual Demo Behavior

Manual "Roast me now" and "Screenshot + LinkedIn Link" actions bypass this package. They should not clear or resample the active random alarm unless the user explicitly toggles Uncognito on or off.

## Test Focus

- Exponential formula is deterministic with injected `U`.
- Bounds are applied per intensity.
- Demo mode always lands in the 30-60 second window.
- Rate-limit retry overrides random sampling.
- Chrome alarm conversion respects the 30-second minimum.
- Disabled scheduling clears instead of rescheduling.

See `agents/random-trigger.md` for the full owner contract.
