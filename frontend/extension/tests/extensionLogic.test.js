import assert from "node:assert/strict";
import test from "node:test";

import { getNextCaptureDelayMs, retryAfterToDelayMs } from "../src/lib/scheduler.js";
import { getSourceMetadata, isRestrictedTabUrl } from "../src/lib/tabs.js";
import { buildUploadPayload, buildUploadUrl } from "../src/lib/upload.js";

test("demo interval is clamped to the live demo window", () => {
  assert.equal(getNextCaptureDelayMs("demo", () => 0.999), 30000);
  assert.equal(getNextCaptureDelayMs("demo", () => Number.EPSILON), 60000);
});

test("normal intensities return safe clamped delays", () => {
  assert.equal(getNextCaptureDelayMs("low", () => 0.999), 15 * 60 * 1000);
  assert.equal(getNextCaptureDelayMs("medium", () => Number.EPSILON), 60 * 60 * 1000);
  const highDelay = getNextCaptureDelayMs("high", () => 0.5);
  assert.ok(highDelay >= 3 * 60 * 1000);
  assert.ok(highDelay <= 20 * 60 * 1000);
});

test("retryAfterToDelayMs maps server retry seconds to milliseconds", () => {
  assert.equal(retryAfterToDelayMs(30), 30000);
  assert.equal(retryAfterToDelayMs("2"), 2000);
  assert.equal(retryAfterToDelayMs(null), null);
});

test("restricted tab URLs are skipped", () => {
  assert.equal(isRestrictedTabUrl("chrome://extensions"), true);
  assert.equal(isRestrictedTabUrl("about:blank"), true);
  assert.equal(isRestrictedTabUrl("https://youtube.com"), false);
});

test("source metadata only keeps host and title", () => {
  assert.deepEqual(
    getSourceMetadata({
      url: "https://www.youtube.com/watch?v=abc123",
      title: "YouTube",
    }),
    {
      sourceHost: "www.youtube.com",
      sourceTitle: "YouTube",
    },
  );
});

test("upload contract targets /api/upload", () => {
  assert.equal(buildUploadUrl("http://localhost:3000/"), "http://localhost:3000/api/upload");
});

test("upload payload includes required capture metadata", () => {
  const payload = buildUploadPayload({
    imageBase64: "data:image/png;base64,abc",
    tab: {
      sourceHost: "youtube.com",
      sourceTitle: "YouTube",
    },
    captureMode: "demo_linkedin_link",
    timestamp: new Date("2026-05-02T10:00:00.000Z"),
  });

  assert.deepEqual(payload, {
    imageBase64: "data:image/png;base64,abc",
    sourceHost: "youtube.com",
    sourceTitle: "YouTube",
    captureMode: "demo_linkedin_link",
    clientTimestamp: "2026-05-02T10:00:00.000Z",
  });
});
