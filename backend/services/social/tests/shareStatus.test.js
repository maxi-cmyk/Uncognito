import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  getInitialShareStatus,
  isShareable,
  isFailed,
  isValidShareStatus,
} from "../src/shareStatus.js";

describe("shareStatus", () => {
  describe("getInitialShareStatus", () => {
    it('returns "link_ready" for demo_linkedin_link capture mode', () => {
      const status = getInitialShareStatus("demo_linkedin_link");
      assert.equal(status, "link_ready");
    });

    it('returns "not_shared" for random capture mode', () => {
      const status = getInitialShareStatus("random");
      assert.equal(status, "not_shared");
    });

    it('returns "not_shared" for manual capture mode', () => {
      const status = getInitialShareStatus("manual");
      assert.equal(status, "not_shared");
    });
  });

  describe("isShareable", () => {
    it('returns true for "link_ready"', () => {
      assert.equal(isShareable("link_ready"), true);
    });

    it('returns true for "shared"', () => {
      assert.equal(isShareable("shared"), true);
    });

    it('returns false for "not_shared"', () => {
      assert.equal(isShareable("not_shared"), false);
    });

    it('returns false for "failed"', () => {
      assert.equal(isShareable("failed"), false);
    });
  });

  describe("isFailed", () => {
    it('returns true for "failed"', () => {
      assert.equal(isFailed("failed"), true);
    });

    it('returns false for "not_shared"', () => {
      assert.equal(isFailed("not_shared"), false);
    });

    it('returns false for "link_ready"', () => {
      assert.equal(isFailed("link_ready"), false);
    });
  });

  describe("isValidShareStatus", () => {
    it("returns true for all valid statuses", () => {
      assert.equal(isValidShareStatus("not_shared"), true);
      assert.equal(isValidShareStatus("link_ready"), true);
      assert.equal(isValidShareStatus("shared"), true);
      assert.equal(isValidShareStatus("failed"), true);
    });

    it("returns false for invalid status", () => {
      assert.equal(isValidShareStatus("pending"), false);
      assert.equal(isValidShareStatus(""), false);
    });
  });
});
