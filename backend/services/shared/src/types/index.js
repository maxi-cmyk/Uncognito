/**
 * @typedef {"random" | "manual" | "demo_linkedin_link"} CaptureMode
 */

/**
 * @typedef {"processing" | "public" | "hidden" | "failed" | "deleted"} RoastStatus
 */

/**
 * @typedef {"not_shared" | "link_ready" | "shared" | "failed"} ShareStatus
 */

/**
 * @typedef {"low" | "medium" | "high" | "demo"} Intensity
 */

/**
 * @typedef {{
 *   id: string
 *   status: RoastStatus
 *   imageBucket?: string
 *   imagePath?: string
 *   imageUrl?: string
 *   caption?: string
 *   sourceHost?: string
 *   sourceTitle?: string
 *   captureMode: CaptureMode
 *   clientTimestamp?: string
 *   themes: string[]
 *   shareStatus: ShareStatus
 *   errorReason?: string
 *   createdAt: string
 *   updatedAt: string
 *   hiddenAt?: string
 *   deletedAt?: string
 * }} Roast
 */

/**
 * @typedef {{
 *   imageBase64: string
 *   sourceHost?: string
 *   sourceTitle?: string
 *   captureMode: CaptureMode
 *   clientTimestamp?: string
 * }} UploadRequest
 */

/**
 * @typedef {{
 *   id: string
 *   caption: string
 *   imageUrl: string
 *   publicUrl: string
 *   shareStatus: ShareStatus
 *   linkedInShareUrl?: string
 *   createdAt: string
 * }} UploadResponse
 */

/**
 * @typedef {{
 *   roasts: Roast[]
 *   total: number
 * }} PaginatedRoasts
 */

/**
 * @typedef {{
 *   error: string
 *   message: string
 *   retryAfterSeconds?: number
 * }} ApiError
 */

export const CAPTURE_MODES = /** @type {const} */ (["random", "manual", "demo_linkedin_link"]);

export const ROAST_STATUSES = /** @type {const} */ ([
  "processing",
  "public",
  "hidden",
  "failed",
  "deleted",
]);

export const SHARE_STATUSES = /** @type {const} */ ([
  "not_shared",
  "link_ready",
  "shared",
  "failed",
]);

export const INTENSITIES = /** @type {const} */ (["low", "medium", "high", "demo"]);
