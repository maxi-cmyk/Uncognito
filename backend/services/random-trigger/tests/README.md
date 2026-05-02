# Random Trigger Tests

Deterministic test coverage:

- Preset validation for `low`, `medium`, `high`, and `demo`.
- Exponential sampling with injected random values.
- Clamp behavior for very small and very large sampled delays.
- Demo-mode 30-60 second guarantee.
- `retryAfterSeconds` override behavior.
- Chrome alarm minimum conversion to `0.5` minutes.
- Disabled and startup-reconciliation schedule behavior.
