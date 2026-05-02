import { SHARE_STATUSES } from "@uncognito/shared";

/**
 * Get the initial share status based on capture mode.
 * Returns 'link_ready' for demo_linkedin_link, otherwise 'not_shared'.
 * @param {import("@uncognito/shared").CaptureMode} captureMode
 * @returns {import("@uncognito/shared").ShareStatus}
 */
export function getInitialShareStatus(captureMode) {
  if (captureMode === "demo_linkedin_link") {
    return "link_ready";
  }
  return "not_shared";
}

/**
 * Check if a share status represents a ready-to-share state.
 * @param {import("@uncognito/shared").ShareStatus} status
 * @returns {boolean}
 */
export function isShareable(status) {
  return status === "link_ready" || status === "shared";
}

/**
 * Check if a share status represents a failure state.
 * @param {import("@uncognito/shared").ShareStatus} status
 * @returns {boolean}
 */
export function isFailed(status) {
  return status === "failed";
}

/**
 * Validate a share status value.
 * @param {string} status
 * @returns {status is import("@uncognito/shared").ShareStatus}
 */
export function isValidShareStatus(status) {
  return SHARE_STATUSES.includes(/** @type {any} */ (status));
}
