export const INTENSITY_PRESETS = Object.freeze({
  low: { meanMs: 60 * 60 * 1000, minMs: 15 * 60 * 1000, maxMs: 2 * 60 * 60 * 1000 },
  medium: { meanMs: 30 * 60 * 1000, minMs: 10 * 60 * 1000, maxMs: 60 * 60 * 1000 },
  high: { meanMs: 10 * 60 * 1000, minMs: 3 * 60 * 1000, maxMs: 20 * 60 * 1000 },
  demo: { meanMs: 45 * 1000, minMs: 30 * 1000, maxMs: 60 * 1000 },
});

export function getNextCaptureDelayMs(intensity, random = Math.random) {
  const preset = INTENSITY_PRESETS[intensity] ?? INTENSITY_PRESETS.demo;
  const u = clampRandom(random());
  const sampledDelay = -Math.log(u) * preset.meanMs;

  return clamp(sampledDelay, preset.minMs, preset.maxMs);
}

export function getNextCaptureAt(intensity, now = Date.now(), random = Math.random) {
  return new Date(now + getNextCaptureDelayMs(intensity, random)).toISOString();
}

export function retryAfterToDelayMs(retryAfterSeconds) {
  const seconds = Number(retryAfterSeconds);
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : null;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function clampRandom(value) {
  if (!Number.isFinite(value)) {
    return 0.5;
  }

  return Math.max(Number.EPSILON, Math.min(1 - Number.EPSILON, value));
}
