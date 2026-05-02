# Browser Extension

Chrome Manifest V3 extension for opt-in capture, manual demo roasts, randomized alarms, and upload status.

Primary owners:

- Extension Scout Agent
- Random Trigger Agent
- Privacy Redaction Agent

Expected source areas:

- `src/background` - alarms, capture orchestration, upload calls.
- `src/popup` - enable toggle, intensity controls, manual capture.
- `src/content` - optional masking helpers.
- `src/lib` - shared extension utilities.
