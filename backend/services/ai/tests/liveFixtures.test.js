import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { generateRoastCaption, imageFileToDataUrl } from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtureDir = join(__dirname, "fixtures");
const repoRoot = join(__dirname, "..", "..", "..", "..");
const envPath = join(repoRoot, ".env");

test("live OpenAI roast generation works against screenshot fixtures", async (t) => {
  loadDotEnv(envPath);

  if (!process.env.OPENAI_API_KEY) {
    t.skip("OPENAI_API_KEY is not set.");
    return;
  }

  if (!existsSync(fixtureDir)) {
    t.skip("No screenshot fixture directory exists.");
    return;
  }

  const fixtures = readdirSync(fixtureDir)
    .filter((name) => /\.(png|jpe?g|webp)$/i.test(name))
    .map((name) => join(fixtureDir, name));

  if (fixtures.length === 0) {
    t.skip("No PNG, JPEG, or WEBP screenshots found in tests/fixtures.");
    return;
  }

  for (const fixture of fixtures) {
    const imageBase64 = await imageFileToDataUrl(fixture);
    const caption = await generateRoastCaption({ imageBase64 });

    assert.ok(caption.length > 0, `${fixture} should return a caption.`);
    assert.ok(caption.length <= 220, `${fixture} caption should fit preview limits.`);
    console.log(`${fixture}: ${caption}`);
  }
});

function loadDotEnv(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    if (!line || line.trimStart().startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex);
    const value = line.slice(separatorIndex + 1);
    process.env[key] ??= value;
  }
}
