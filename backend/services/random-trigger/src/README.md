# Source Layout

Implementation modules:

- `presets.ts` - intensity preset constants and validation.
- `exponential.ts` - pure exponential sampling and random normalization.
- `schedule.ts` - capture outcome to next schedule conversion.
- `chrome-alarm.ts` - `delayMs` to `delayInMinutes` conversion helpers.
- `index.ts` - public exports.

Keep browser API calls out of this package. The extension owns `chrome.alarms`.
