import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { generateLinkedInShareUrl, extractRoastUrl } from "../src/linkBuilder.js";

describe("linkBuilder", () => {
  describe("generateLinkedInShareUrl", () => {
    it("generates a valid LinkedIn share URL with just a URL", () => {
      const result = generateLinkedInShareUrl("https://uncognito.example/roast/rst_abc123");

      assert.ok(result.startsWith("https://www.linkedin.com/sharing/share-offsite/?"));
      assert.ok(result.includes("url=https%3A%2F%2Funcognito.example%2Froast%2Frst_abc123"));
    });

    it("includes title and summary when caption is provided", () => {
      const result = generateLinkedInShareUrl(
        "https://uncognito.example/roast/rst_abc123",
        "Three tabs deep."
      );

      assert.ok(result.includes("title=Uncognito+caught+a+roast"));
      assert.ok(result.includes("summary=Three+tabs+deep."));
    });

    it("does not include title/summary when caption is empty", () => {
      const result = generateLinkedInShareUrl("https://uncognito.example/roast/rst_abc123", "");

      assert.ok(!result.includes("title="));
      assert.ok(!result.includes("summary="));
    });

    it("does not include title/summary when caption is undefined", () => {
      const result = generateLinkedInShareUrl("https://uncognito.example/roast/rst_abc123");

      assert.ok(!result.includes("title="));
      assert.ok(!result.includes("summary="));
    });

    it("URL-encodes special characters in the URL", () => {
      const result = generateLinkedInShareUrl("https://example.com/roast/rst_test?id=123&ref=share");

      assert.ok(result.includes("url=https%3A%2F%2Fexample.com%2Froast%2Frst_test"));
    });

    it("returns a valid URL that can be parsed", () => {
      const result = generateLinkedInShareUrl("https://uncognito.example/roast/rst_abc123");

      const parsed = new URL(result);
      assert.equal(parsed.hostname, "www.linkedin.com");
      assert.equal(parsed.pathname, "/sharing/share-offsite/");
    });
  });

  describe("extractRoastUrl", () => {
    it("extracts the roast URL from a LinkedIn share URL", () => {
      const shareUrl = generateLinkedInShareUrl("https://uncognito.example/roast/rst_abc123");
      const extracted = extractRoastUrl(shareUrl);

      assert.equal(extracted, "https://uncognito.example/roast/rst_abc123");
    });

    it("returns null for an invalid URL", () => {
      const extracted = extractRoastUrl("not-a-url");

      assert.equal(extracted, null);
    });

    it("returns null when no url param is present", () => {
      const extracted = extractRoastUrl("https://www.linkedin.com/sharing/share-offsite/");

      assert.equal(extracted, null);
    });
  });
});
