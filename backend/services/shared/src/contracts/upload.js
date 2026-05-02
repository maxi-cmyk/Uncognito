import { CAPTURE_MODES } from "../types/index.js";

/**
 * Build the response for a successfully created roast.
 * @param {import("../types/index.js").Roast} roast
 * @param {string} publicAppUrl
 * @returns {import("../types/index.js").UploadResponse}
 */
export function buildUploadResponse(roast, publicAppUrl) {
  const publicUrl = `${publicAppUrl}/roast/${roast.id}`;
  const response = {
    id: roast.id,
    caption: roast.caption || "",
    imageUrl: roast.imageUrl || "",
    publicUrl,
    shareStatus: roast.shareStatus,
    createdAt: roast.createdAt,
  };

  if (
    roast.captureMode === "demo_linkedin_link" &&
    roast.shareStatus === "link_ready" &&
    roast.caption
  ) {
    response.linkedInShareUrl = buildLinkedInShareUrl(publicUrl, roast.caption);
  }

  return response;
}

/**
 * Build the LinkedIn share URL for a roast.
 * @param {string} publicUrl
 * @param {string} caption
 * @returns {string}
 */
export function buildLinkedInShareUrl(publicUrl, caption) {
  const params = new URLSearchParams();
  params.set("url", publicUrl);
  if (caption) {
    params.set("title", "Uncognito caught a roast");
    params.set("summary", caption);
  }
  return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
}

/**
 * Build a standard error response.
 * @param {string} error
 * @param {string} message
 * @param {number} [retryAfterSeconds]
 * @returns {import("../types/index.js").ApiError}
 */
export function buildErrorResponse(error, message, retryAfterSeconds) {
  const response = { error, message };
  if (retryAfterSeconds) {
    response.retryAfterSeconds = retryAfterSeconds;
  }
  return response;
}
