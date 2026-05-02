/**
 * @typedef {import("@supabase/supabase-js").SupabaseClient} SupabaseClient
 * @typedef {import("@uncognito/shared").Roast} Roast
 * @typedef {import("@uncognito/shared").CaptureMode} CaptureMode
 * @typedef {import("@uncognito/shared").ShareStatus} ShareStatus
 */

const LOG_PREFIX = "[storage]";

/**
 * Create a processing roast record.
 * @param {SupabaseClient} supabase
 * @param {{ sourceHost?: string, sourceTitle?: string, captureMode: CaptureMode, clientTimestamp?: string }} input
 * @returns {Promise<Roast>}
 */
export async function createProcessingRoast(supabase, input) {
  console.log(`${LOG_PREFIX} Creating processing roast | captureMode=${input.captureMode}`);

  const { data, error } = await supabase
    .from("roasts")
    .insert({
      source_host: input.sourceHost || null,
      source_title: input.sourceTitle || null,
      capture_mode: input.captureMode,
      client_timestamp: input.clientTimestamp || null,
    })
    .select()
    .single();

  if (error) {
    console.error(`${LOG_PREFIX} Failed to create roast | error=${error.message}`);
    throw new Error(`Failed to create roast: ${error.message}`);
  }

  console.log(`${LOG_PREFIX} Created processing roast | id=${mapRow(data).id}`);
  return mapRow(data);
}

/**
 * Upload a roast image to Supabase Storage.
 * @param {SupabaseClient} supabase
 * @param {{ roastId: string, imageBase64: string, bucket?: string }} input
 * @returns {Promise<{ imagePath: string, imageUrl: string }>}
 */
export async function uploadRoastImage(supabase, input) {
  const bucket = input.bucket || "roast-images";
  const ext = getImageExtension(input.imageBase64);
  const imagePath = `roasts/${input.roastId}/capture.${ext}`;

  console.log(`${LOG_PREFIX} Uploading image | roastId=${input.roastId} path=${imagePath} bucket=${bucket}`);

  const bytes = Buffer.from(input.imageBase64.split(",")[1], "base64");

  const { error } = await supabase.storage
    .from(bucket)
    .upload(imagePath, bytes, {
      contentType: `image/${ext}`,
      upsert: true,
    });

  if (error) {
    console.error(`${LOG_PREFIX} Image upload failed | roastId=${input.roastId} error=${error.message}`);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(imagePath);

  console.log(`${LOG_PREFIX} Image uploaded | roastId=${input.roastId} url=${urlData.publicUrl}`);
  return { imagePath, imageUrl: urlData.publicUrl };
}

/**
 * Publish a roast (update caption, image, and set status to public).
 * @param {SupabaseClient} supabase
 * @param {{ roastId: string, imagePath: string, imageUrl: string, caption: string, themes?: string[] }} input
 * @returns {Promise<Roast>}
 */
export async function publishRoast(supabase, input) {
  console.log(`${LOG_PREFIX} Publishing roast | roastId=${input.roastId} caption=${input.caption.slice(0, 60)}...`);

  const { data, error } = await supabase
    .from("roasts")
    .update({
      status: "public",
      image_path: input.imagePath,
      image_url: input.imageUrl,
      caption: input.caption,
      themes: input.themes || [],
    })
    .eq("id", input.roastId)
    .select()
    .single();

  if (error) {
    console.error(`${LOG_PREFIX} Publish failed | roastId=${input.roastId} error=${error.message}`);
    throw new Error(`Failed to publish roast: ${error.message}`);
  }

  console.log(`${LOG_PREFIX} Roast published | roastId=${input.roastId}`);
  return mapRow(data);
}

/**
 * Mark a roast as failed.
 * @param {SupabaseClient} supabase
 * @param {string} roastId
 * @param {string} reason
 * @returns {Promise<Roast>}
 */
export async function markRoastFailed(supabase, roastId, reason) {
  console.warn(`${LOG_PREFIX} Marking roast failed | roastId=${roastId} reason=${reason}`);

  const { data, error } = await supabase
    .from("roasts")
    .update({ status: "failed", error_reason: reason })
    .eq("id", roastId)
    .select()
    .single();

  if (error) throw new Error(`Failed to mark roast as failed: ${error.message}`);
  return mapRow(data);
}

/**
 * List public roasts, ordered by created_at descending.
 * @param {SupabaseClient} supabase
 * @param {{ limit?: number, offset?: number }} [options]
 * @returns {Promise<{ roasts: Roast[], total: number }>}
 */
export async function listPublicRoasts(supabase, options = {}) {
  const limit = options.limit || 50;
  const offset = options.offset || 0;

  const { data, count, error } = await supabase
    .from("roasts")
    .select("*", { count: "exact" })
    .eq("status", "public")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`Failed to list roasts: ${error.message}`);
  console.log(`${LOG_PREFIX} Listed public roasts | count=${count || 0}`);
  return { roasts: (data || []).map(mapRow), total: count || 0 };
}

/**
 * Get a public roast by ID.
 * @param {SupabaseClient} supabase
 * @param {string} id
 * @returns {Promise<Roast | null>}
 */
export async function getPublicRoast(supabase, id) {
  const { data, error } = await supabase
    .from("roasts")
    .select("*")
    .eq("id", id)
    .eq("status", "public")
    .single();

  if (error) return null;
  return mapRow(data);
}

/**
 * List all roasts regardless of status (admin only).
 * @param {SupabaseClient} supabase
 * @param {{ limit?: number, offset?: number }} [options]
 * @returns {Promise<{ roasts: Roast[], total: number }>}
 */
export async function listAllRoasts(supabase, options = {}) {
  const limit = options.limit || 100;
  const offset = options.offset || 0;

  const { data, count, error } = await supabase
    .from("roasts")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`Failed to list roasts: ${error.message}`);
  return { roasts: (data || []).map(mapRow), total: count || 0 };
}

/**
 * Get any roast by ID (for owner/admin operations).
 * @param {SupabaseClient} supabase
 * @param {string} id
 * @returns {Promise<Roast | null>}
 */
export async function getRoast(supabase, id) {
  const { data, error } = await supabase
    .from("roasts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return mapRow(data);
}

/**
 * Hide a roast.
 * @param {SupabaseClient} supabase
 * @param {string} roastId
 * @returns {Promise<Roast>}
 */
export async function hideRoast(supabase, roastId) {
  console.log(`${LOG_PREFIX} Hiding roast | roastId=${roastId}`);

  const { data, error } = await supabase
    .from("roasts")
    .update({ status: "hidden", hidden_at: new Date().toISOString() })
    .eq("id", roastId)
    .select()
    .single();

  if (error) throw new Error(`Failed to hide roast: ${error.message}`);
  console.log(`${LOG_PREFIX} Roast hidden | roastId=${roastId}`);
  return mapRow(data);
}

/**
 * Delete a roast.
 * @param {SupabaseClient} supabase
 * @param {string} roastId
 * @returns {Promise<void>}
 */
export async function deleteRoast(supabase, roastId) {
  console.log(`${LOG_PREFIX} Deleting roast | roastId=${roastId}`);

  const { error: delError } = await supabase
    .from("roasts")
    .update({ status: "deleted", deleted_at: new Date().toISOString() })
    .eq("id", roastId);

  if (delError) throw new Error(`Failed to delete roast: ${delError.message}`);
  console.log(`${LOG_PREFIX} Roast deleted | roastId=${roastId}`);
}

/**
 * Update share status on a roast.
 * @param {SupabaseClient} supabase
 * @param {string} roastId
 * @param {ShareStatus} status
 * @returns {Promise<Roast>}
 */
export async function updateShareStatus(supabase, roastId, status) {
  console.log(`${LOG_PREFIX} Updating share status | roastId=${roastId} status=${status}`);

  const { data, error } = await supabase
    .from("roasts")
    .update({ share_status: status })
    .eq("id", roastId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update share status: ${error.message}`);
  return mapRow(data);
}

/**
 * Delete an image from Supabase Storage.
 * @param {SupabaseClient} supabase
 * @param {string} imagePath
 * @param {string} [bucket]
 * @returns {Promise<void>}
 */
export async function deleteRoastImage(supabase, imagePath, bucket) {
  console.log(`${LOG_PREFIX} Deleting image | path=${imagePath}`);

  const { error } = await supabase.storage
    .from(bucket || "roast-images")
    .remove([imagePath]);

  if (error) {
    console.error(`${LOG_PREFIX} Image deletion failed | path=${imagePath} error=${error.message}`);
    throw new Error(`Failed to delete image: ${error.message}`);
  }

  console.log(`${LOG_PREFIX} Image deleted | path=${imagePath}`);
}

/**
 * Map a Supabase DB row to a Roast object.
 * @param {Record<string, unknown>} row
 * @returns {Roast}
 */
function mapRow(row) {
  return {
    id: /** @type {string} */ (row.id),
    status: /** @type {import("@uncognito/shared").Roast["status"]} */ (row.status),
    imageBucket: /** @type {string | undefined} */ (row.image_bucket),
    imagePath: /** @type {string | undefined} */ (row.image_path),
    imageUrl: /** @type {string | undefined} */ (row.image_url),
    caption: /** @type {string | undefined} */ (row.caption),
    sourceHost: /** @type {string | undefined} */ (row.source_host),
    sourceTitle: /** @type {string | undefined} */ (row.source_title),
    captureMode: /** @type {import("@uncognito/shared").CaptureMode} */ (row.capture_mode),
    clientTimestamp: /** @type {string | undefined} */ (row.client_timestamp),
    themes: /** @type {string[]} */ (row.themes || []),
    shareStatus: /** @type {import("@uncognito/shared").ShareStatus} */ (row.share_status),
    errorReason: /** @type {string | undefined} */ (row.error_reason),
    createdAt: /** @type {string} */ (row.created_at),
    updatedAt: /** @type {string} */ (row.updated_at),
    hiddenAt: /** @type {string | undefined} */ (row.hidden_at),
    deletedAt: /** @type {string | undefined} */ (row.deleted_at),
  };
}

/**
 * Get the image extension from a base64 data URI.
 * @param {string} dataUri
 * @returns {string}
 */
function getImageExtension(dataUri) {
  const match = dataUri.match(/^data:image\/(png|jpeg|webp);/);
  if (match) return match[1] === "jpeg" ? "jpg" : match[1];
  return "png";
}

/**
 * @typedef {{ allowed: boolean, retryAfterSeconds?: number }} RateLimitResult
 */

const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_ATTEMPTS = 5;

/**
 * Check whether a client fingerprint has exceeded the rate limit.
 * @param {SupabaseClient} supabase
 * @param {string} fingerprint
 * @param {{ windowSeconds?: number, maxAttempts?: number }} [options]
 * @returns {Promise<RateLimitResult>}
 */
export async function checkRateLimit(supabase, fingerprint, options = {}) {
  const windowSeconds = options.windowSeconds || RATE_LIMIT_WINDOW_SECONDS;
  const maxAttempts = options.maxAttempts || RATE_LIMIT_MAX_ATTEMPTS;

  const cutoff = new Date(Date.now() - windowSeconds * 1000).toISOString();

  const { count, error } = await supabase
    .from("upload_attempts")
    .select("*", { count: "exact", head: true })
    .eq("client_fingerprint", fingerprint)
    .eq("outcome", "accepted")
    .gte("created_at", cutoff);

  if (error) {
    console.error(`${LOG_PREFIX} Rate limit check failed | error=${error.message}`);
    return { allowed: true };
  }

  if (count >= maxAttempts) {
    console.warn(`${LOG_PREFIX} Rate limit reached | fingerprint=${fingerprint} count=${count}/${maxAttempts}`);
    return { allowed: false, retryAfterSeconds: windowSeconds };
  }

  return { allowed: true };
}

/**
 * Record an upload attempt for rate limiting.
 * @param {SupabaseClient} supabase
 * @param {{ fingerprint: string, captureMode: import("@uncognito/shared").CaptureMode, outcome: string, roastId?: string, errorCode?: string }} input
 * @returns {Promise<void>}
 */
export async function recordUploadAttempt(supabase, input) {
  try {
    await supabase.from("upload_attempts").insert({
      client_fingerprint: input.fingerprint,
      capture_mode: input.captureMode,
      outcome: input.outcome,
      roast_id: input.roastId || null,
      error_code: input.errorCode || null,
    });
  } catch (error) {
    console.error(`${LOG_PREFIX} Failed to record upload attempt | fingerprint=${input.fingerprint} error=${error.message}`);
  }
}
