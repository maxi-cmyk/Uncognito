import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  ALARM_NAME,
  CHROME_MIN_ALARM_DELAY_MS,
  INTENSITY_PRESETS,
  clampDelayMs,
  getIntensityPreset,
  getNextCaptureDelayMs,
  getNextSchedule,
  normalizeRandomValue,
  sampleExponentialDelayMs,
  toChromeDelayInMinutes,
} from "../src/index.ts";

const minute = 60_000;

describe("random trigger presets", () => {
  it("maps PRD intensities to expected means and safety clamps", () => {
    assert.equal(INTENSITY_PRESETS.low.meanMs, 60 * minute);
    assert.equal(INTENSITY_PRESETS.medium.meanMs, 30 * minute);
    assert.equal(INTENSITY_PRESETS.high.meanMs, 10 * minute);
    assert.equal(INTENSITY_PRESETS.demo.meanMs, 45_000);

    assert.equal(INTENSITY_PRESETS.demo.minMs, 30_000);
    assert.equal(INTENSITY_PRESETS.demo.maxMs, 60_000);
  });

  it("falls back to medium for unknown intensities", () => {
    assert.equal(getIntensityPreset("unknown").intensity, "medium");
  });
});

describe("exponential delay sampling", () => {
  it("returns the mean when U is e^-1", () => {
    const delay = sampleExponentialDelayMs({
      intensity: "medium",
      random: () => Math.exp(-1),
    });

    assert.equal(delay, 30 * minute);
  });

  it("normalizes invalid random values away from zero and one", () => {
    assert.equal(normalizeRandomValue(0), 1e-12);
    assert.equal(normalizeRandomValue(1), 1 - 1e-12);
    assert.equal(normalizeRandomValue(Number.NaN), 0.5);
  });

  it("clamps sampled delays by intensity", () => {
    const preset = getIntensityPreset("high");

    assert.equal(clampDelayMs(1, preset), 2 * minute);
    assert.equal(clampDelayMs(60 * minute, preset), 30 * minute);
  });

  it("keeps demo mode inside the 30-60 second window", () => {
    const nearImmediate = getNextCaptureDelayMs({
      intensity: "demo",
      random: () => 1 - 1e-15,
    });
    const veryLong = getNextCaptureDelayMs({
      intensity: "demo",
      random: () => 1e-15,
    });

    assert.equal(nearImmediate, 30_000);
    assert.equal(veryLong, 60_000);
  });
});

describe("chrome alarm schedule conversion", () => {
  it("uses the named one-shot random capture alarm", () => {
    assert.equal(ALARM_NAME, "uncognito.random-capture");
  });

  it("does not schedule below the Chrome alarm minimum", () => {
    assert.equal(CHROME_MIN_ALARM_DELAY_MS, 30_000);
    assert.equal(toChromeDelayInMinutes(1_000), 0.5);
  });

  it("returns a deterministic initial schedule", () => {
    const schedule = getNextSchedule({
      intensity: "low",
      reason: "initial",
      nowMs: 0,
      random: () => Math.exp(-1),
    });

    assert.deepEqual(schedule, {
      alarmName: "uncognito.random-capture",
      delayMs: 60 * minute,
      delayInMinutes: 60,
      scheduledFor: new Date(60 * minute).toISOString(),
      reason: "initial",
    });
  });

  it("lets backend rate limits override random sampling", () => {
    const schedule = getNextSchedule({
      intensity: "high",
      nowMs: 0,
      outcome: { type: "rate_limited", retryAfterSeconds: 300 },
      random: () => Math.exp(-1),
    });

    assert.equal(schedule?.delayMs, 300_000);
    assert.equal(schedule?.delayInMinutes, 5);
    assert.equal(schedule?.reason, "rate_limited");
  });

  it("clamps invalid backend retry delays to the Chrome alarm minimum", () => {
    const schedule = getNextSchedule({
      intensity: "high",
      nowMs: 0,
      outcome: { type: "rate_limited", retryAfterSeconds: Number.NaN },
      random: () => Math.exp(-1),
    });

    assert.deepEqual(schedule, {
      alarmName: "uncognito.random-capture",
      delayMs: 30_000,
      delayInMinutes: 0.5,
      scheduledFor: new Date(30_000).toISOString(),
      reason: "rate_limited",
    });
  });

  it("can rebuild a schedule during startup reconciliation", () => {
    const schedule = getNextSchedule({
      intensity: "medium",
      reason: "startup_reconcile",
      nowMs: 0,
      random: () => Math.exp(-1),
    });

    assert.equal(schedule?.delayMs, 30 * minute);
    assert.equal(schedule?.reason, "startup_reconcile");
  });

  it("does not reschedule when the extension is disabled", () => {
    const schedule = getNextSchedule({
      intensity: "medium",
      outcome: { type: "skipped", reason: "disabled" },
      random: () => Math.exp(-1),
    });

    assert.equal(schedule, null);
  });
});
