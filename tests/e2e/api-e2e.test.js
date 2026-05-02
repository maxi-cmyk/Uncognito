import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";

const BASE = "http://localhost:3000";
const DUMMY_IMAGE = "data:image/png;base64,iVBORw0KGgo=";

describe("E2E: API upload flow", () => {
  let createdRoastId;
  let adminToken;

  before(() => {
    adminToken = process.env.ADMIN_TOKEN || "dev-token";
  });

  it("POST /api/upload creates a roast with random captureMode", async () => {
    const res = await fetch(`${BASE}/api/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageBase64: DUMMY_IMAGE,
        sourceHost: "e2e-test.example.com",
        captureMode: "random",
      }),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.ok(body.id);
    assert.ok(body.caption);
    assert.ok(body.imageUrl);
    assert.ok(body.publicUrl);
    assert.equal(body.shareStatus, "not_shared");
    assert.ok(!body.linkedInShareUrl);

    createdRoastId = body.id;
  });

  it("POST /api/upload with demo_linkedin_link returns linkedInShareUrl", async () => {
    const res = await fetch(`${BASE}/api/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageBase64: DUMMY_IMAGE,
        sourceHost: "e2e-linkedin.example.com",
        captureMode: "demo_linkedin_link",
      }),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.shareStatus, "link_ready");
    assert.ok(body.linkedInShareUrl);
    assert.ok(body.linkedInShareUrl.includes("linkedin.com/sharing/share-offsite"));
    assert.ok(body.linkedInShareUrl.includes("url="));
  });

  it("POST /api/upload returns 400 for invalid body", async () => {
    const res = await fetch(`${BASE}/api/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error, "MISSING_IMAGE");
  });

  it("POST /api/upload returns 400 for non-data-uri image", async () => {
    const res = await fetch(`${BASE}/api/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: "not-an-image" }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error, "INVALID_IMAGE_FORMAT");
  });
});

describe("E2E: GET roasts", () => {
  it("GET /api/roasts returns list", async () => {
    const res = await fetch(`${BASE}/api/roasts`);

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.roasts));
    assert.ok(typeof body.total === "number");
  });

  it("GET /api/roasts/:id with valid id returns roast", async () => {
    const listRes = await fetch(`${BASE}/api/roasts`);
    const { roasts } = await listRes.json();

    if (roasts.length === 0) return;

    const roastId = roasts[0].id;
    const res = await fetch(`${BASE}/api/roasts/${roastId}`);

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.id, roastId);
    assert.ok(body.caption);
    assert.ok(body.imageUrl);
  });

  it("GET /api/roasts/:id with invalid id returns 404", async () => {
    const res = await fetch(`${BASE}/api/roasts/nonexistent_id`);

    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.error, "NOT_FOUND");
  });
});

describe("E2E: Share endpoint", () => {
  it("POST /api/share/:id marks roast as shared", async () => {
    const listRes = await fetch(`${BASE}/api/roasts`);
    const { roasts } = await listRes.json();

    if (roasts.length === 0) return;

    const roastId = roasts[0].id;
    const res = await fetch(`${BASE}/api/share/${roastId}`, { method: "POST" });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.publicUrl);
    assert.ok(body.publicUrl.includes(`/roast/${roastId}`));
  });
});

describe("E2E: Admin endpoints", () => {
  it("GET /api/admin/roasts requires admin token", async () => {
    const res = await fetch(`${BASE}/api/admin/roasts`);

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.error, "UNAUTHORIZED");
  });

  it("PATCH /api/roasts/:id hide requires admin token", async () => {
    const res = await fetch(`${BASE}/api/roasts/test-id`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "hide" }),
    });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.error, "UNAUTHORIZED");
  });

  it("DELETE /api/roasts/:id requires admin token", async () => {
    const res = await fetch(`${BASE}/api/roasts/test-id`, { method: "DELETE" });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.error, "UNAUTHORIZED");
  });
});

describe("E2E: Web pages", () => {
  it("GET / returns 200 with HTML", async () => {
    const res = await fetch(`${BASE}/`);

    assert.equal(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes("Wall of Shame"));
    assert.ok(html.includes("Uncognito"));
  });

  it("GET /roast/:id returns 200 for a valid roast", async () => {
    const listRes = await fetch(`${BASE}/api/roasts`);
    const { roasts } = await listRes.json();

    if (roasts.length === 0) return;

    const res = await fetch(`${BASE}/roast/${roasts[0].id}`);

    assert.equal(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes("Share on LinkedIn"));
    assert.ok(html.includes("Copy roast URL"));
  });

  it("GET /roast/:id returns 404 for missing roast", async () => {
    const res = await fetch(`${BASE}/roast/nonexistent_id`);

    assert.equal(res.status, 404);
    const html = await res.text();
    assert.ok(html.includes("Roast missing") || html.includes("not found"));
  });

  it("Roast detail page includes Open Graph metadata", async () => {
    const listRes = await fetch(`${BASE}/api/roasts`);
    const { roasts } = await listRes.json();

    if (roasts.length === 0) return;

    const res = await fetch(`${BASE}/roast/${roasts[0].id}`);
    const html = await res.text();

    assert.ok(html.includes('og:title') || html.includes('property="og:title"'));
    assert.ok(html.includes('og:image') || html.includes('property="og:image"'));
    assert.ok(html.includes('twitter:card') || html.includes('name="twitter:card"'));
  });

  it("GET /admin returns admin page", async () => {
    const res = await fetch(`${BASE}/admin`);

    assert.equal(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes("Admin dashboard") || html.includes("Owner controls"));
  });
});
