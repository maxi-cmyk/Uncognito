import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  buildResponsesRequest,
  generateRoastCaption,
  imageFileToDataUrl,
  normalizeCaption,
} from "../backend/services/ai/src/index.js";
import {
  getNextSchedule,
  toChromeDelayInMinutes,
} from "../backend/services/random-trigger/src/index.ts";

const samplePng = "data:image/png;base64,iVBORw0KGgo=";

test("backend services run a scheduled capture through roast fallback and rescheduling", async () => {
  const initialSchedule = getNextSchedule({
    intensity: "demo",
    reason: "initial",
    nowMs: 0,
    random: () => Math.exp(-1),
  });

  assert.deepEqual(initialSchedule, {
    alarmName: "uncognito.random-capture",
    delayMs: 45_000,
    delayInMinutes: 0.75,
    scheduledFor: new Date(45_000).toISOString(),
    reason: "initial",
  });

  const request = buildResponsesRequest({
    model: "gpt-test",
    imageBase64: samplePng,
    systemPrompt: "system",
    userPrompt: "user",
  });

  assert.equal(request.input[1].content[1].image_url, samplePng);

  const caption = await generateRoastCaption({
    imageBase64: samplePng,
    apiKey: "",
    fallbackCaption: "Fallback roast.",
    fetchImpl: async () => {
      throw new Error("fetch should not run without an API key");
    },
  });

  assert.equal(caption, "Fallback roast.");

  const followupSchedule = getNextSchedule({
    intensity: "demo",
    outcome: { type: "success" },
    nowMs: Date.parse(initialSchedule.scheduledFor),
    random: () => Math.exp(-1),
  });

  assert.equal(normalizeCaption(JSON.stringify({ caption })), caption);
  assert.equal(followupSchedule?.reason, "success");
  assert.equal(followupSchedule?.delayMs, 45_000);
  assert.equal(followupSchedule?.delayInMinutes, toChromeDelayInMinutes(45_000));
  assert.equal(followupSchedule?.scheduledFor, new Date(90_000).toISOString());
});

test("image fixtures can feed the roast request builder", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "uncognito-integration-"));
  const fixturePath = join(tempDir, "capture.webp");

  try {
    await writeFile(fixturePath, Buffer.from("fake-webp-bytes"));

    const dataUrl = await imageFileToDataUrl(fixturePath);
    const request = buildResponsesRequest({
      model: "gpt-test",
      imageBase64: dataUrl,
      systemPrompt: "system",
      userPrompt: "user",
    });

    assert.equal(dataUrl, "data:image/webp;base64,ZmFrZS13ZWJwLWJ5dGVz");
    assert.equal(request.input[1].content[1].image_url, dataUrl);
  } finally {
    await rm(tempDir, { force: true, recursive: true });
  }
});
