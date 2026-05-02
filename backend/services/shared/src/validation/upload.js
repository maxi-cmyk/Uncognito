import { CAPTURE_MODES } from "../types/index.js";

/**
 * Validate an upload request body.
 * @param {unknown} body
 * @returns {{ valid: true, data: import("../types/index.js").UploadRequest } | { valid: false, error: string, message: string }}
 */
export function validateUploadRequest(body) {
  if (!body || typeof body !== "object") {
    return {
      valid: false,
      error: "INVALID_REQUEST",
      message: "Request body must be a JSON object.",
    };
  }

  const data = /** @type {Record<string, unknown>} */ (body);

  if (!data.imageBase64 || typeof data.imageBase64 !== "string") {
    return {
      valid: false,
      error: "MISSING_IMAGE",
      message: "imageBase64 is required and must be a string.",
    };
  }

  if (!data.imageBase64.startsWith("data:image/")) {
    return {
      valid: false,
      error: "INVALID_IMAGE_FORMAT",
      message: "imageBase64 must be a data URI starting with data:image/.",
    };
  }

  const captureMode = data.captureMode || "random";
  if (!CAPTURE_MODES.includes(/** @type {string} */ (captureMode))) {
    return {
      valid: false,
      error: "INVALID_CAPTURE_MODE",
      message: `captureMode must be one of: ${CAPTURE_MODES.join(", ")}.`,
    };
  }

  return {
    valid: true,
    data: {
      imageBase64: data.imageBase64,
      sourceHost: typeof data.sourceHost === "string" ? data.sourceHost : undefined,
      sourceTitle: typeof data.sourceTitle === "string" ? data.sourceTitle : undefined,
      captureMode: /** @type {import("../types/index.js").CaptureMode} */ (captureMode),
      clientTimestamp: typeof data.clientTimestamp === "string" ? data.clientTimestamp : undefined,
    },
  };
}
