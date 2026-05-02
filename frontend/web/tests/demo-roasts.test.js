import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { getDemoRoasts } from "../app/lib/roasts.js";

test("demo screenshots in public/demo-roasts are loaded as public roasts", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "uncognito-demo-roasts-"));

  try {
    await writeFile(join(tempDir, "telegram-confess.png"), "fake image bytes");
    await writeFile(join(tempDir, "notes.txt"), "ignored");

    const roasts = await getDemoRoasts(tempDir);

    assert.deepEqual(roasts, [
      {
        id: "demo_telegram-confess",
        caption:
          "Opened Telegram for one message and accidentally enrolled in a full-time campus drama seminar.",
        imageUrl: "/demo-roasts/telegram-confess.png",
        sourceHost: "web.telegram.org",
        createdAt: "2026-05-02T07:19:48.000Z",
        status: "public",
      },
    ]);
  } finally {
    await rm(tempDir, { force: true, recursive: true });
  }
});
