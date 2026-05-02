import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  RoastGenerationError,
  buildResponsesRequest,
  generateRoastCaption,
  imageFileToDataUrl,
  normalizeCaption,
} from "../src/index.js";

const SAMPLE_IMAGE = "data:image/png;base64,iVBORw0KGgo=";

test("buildResponsesRequest sends prompt and screenshot to the Responses API shape", () => {
  const request = buildResponsesRequest({
    model: "gpt-test",
    imageBase64: SAMPLE_IMAGE,
    systemPrompt: "system prompt",
    userPrompt: "user prompt",
  });

  assert.equal(request.model, "gpt-test");
  assert.equal(request.input[0].role, "system");
  assert.deepEqual(request.input[0].content, [{ type: "input_text", text: "system prompt" }]);
  assert.equal(request.input[1].role, "user");
  assert.deepEqual(request.input[1].content[0], { type: "input_text", text: "user prompt" });
  assert.deepEqual(request.input[1].content[1], {
    type: "input_image",
    image_url: SAMPLE_IMAGE,
  });
  assert.equal(request.text.format.type, "json_schema");
  assert.equal(request.text.format.schema.properties.caption.maxLength, 220);
});

test("generateRoastCaption returns caption from output_text JSON", async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });

    return {
      ok: true,
      async json() {
        return {
          output_text: JSON.stringify({
            caption: "Your calendar said focus time, but your tabs filed a formal objection.",
          }),
        };
      },
    };
  };

  const caption = await generateRoastCaption({
    imageBase64: SAMPLE_IMAGE,
    apiKey: "test-key",
    model: "gpt-test",
    fetchImpl,
  });

  assert.equal(
    caption,
    "Your calendar said focus time, but your tabs filed a formal objection.",
  );
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.openai.com/v1/responses");
  assert.equal(calls[0].init.headers.Authorization, "Bearer test-key");
});

test("generateRoastCaption returns fallback when api key is absent", async () => {
  const caption = await generateRoastCaption({
    imageBase64: SAMPLE_IMAGE,
    apiKey: "",
    fallbackCaption: "Fallback roast.",
    fetchImpl: async () => {
      throw new Error("fetch should not run");
    },
  });

  assert.equal(caption, "Fallback roast.");
});

test("generateRoastCaption rejects non-image data URLs", async () => {
  await assert.rejects(
    () =>
      generateRoastCaption({
        imageBase64: "not an image",
        apiKey: "test-key",
        fetchImpl: async () => ({ ok: true }),
      }),
    RoastGenerationError,
  );
});

test("generateRoastCaption throws a useful error on OpenAI failure", async () => {
  await assert.rejects(
    () =>
      generateRoastCaption({
        imageBase64: SAMPLE_IMAGE,
        apiKey: "test-key",
        fetchImpl: async () => ({
          ok: false,
          status: 401,
          async text() {
            return "bad key";
          },
        }),
      }),
    /OpenAI request failed with 401: bad key/,
  );
});

test("normalizeCaption trims whitespace and caps output length", () => {
  const longCaption = `  ${"x".repeat(300)}  `;
  const caption = normalizeCaption(JSON.stringify({ caption: longCaption }));

  assert.equal(caption.length, 220);
  assert.ok(caption.endsWith("..."));
});

test("imageFileToDataUrl converts image fixtures to data URLs", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "uncognito-ai-"));
  const fixturePath = join(tempDir, "screenshot.png");

  try {
    await writeFile(fixturePath, Buffer.from("fake-png-bytes"));

    const dataUrl = await imageFileToDataUrl(fixturePath);

    assert.equal(dataUrl, "data:image/png;base64,ZmFrZS1wbmctYnl0ZXM=");
  } finally {
    await rm(tempDir, { force: true, recursive: true });
  }
});
