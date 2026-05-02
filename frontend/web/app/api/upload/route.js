import { NextResponse } from "next/server";

import { getInitialShareStatus } from "@uncognito/social";
import { buildErrorResponse, buildUploadResponse } from "@uncognito/shared/contracts";
import { validateUploadRequest } from "@uncognito/shared/validation";

import { getSupabase } from "../lib/supabase";

const LOG_PREFIX = "[api:upload]";

export async function POST(request) {
  try {
    console.log(`${LOG_PREFIX} Upload request received`);
    const supabase = await getSupabase();
    return await handleUpload(request, supabase);
  } catch (error) {
    console.error(`${LOG_PREFIX} Unexpected error | error=${error.message}`, error.stack);
    return NextResponse.json(
      buildErrorResponse("INTERNAL_ERROR", "An unexpected error occurred."),
      { status: 500 },
    );
  }
}

async function handleUpload(request, supabase) {
  const fingerprint = getClientFingerprint(request);

  const body = await request.json().catch(() => null);
  const validation = validateUploadRequest(body);

  if (!validation.valid) {
    console.warn(`${LOG_PREFIX} Invalid upload request | error=${validation.error} message=${validation.message}`);
    return NextResponse.json(
      buildErrorResponse(validation.error, validation.message),
      { status: 400 },
    );
  }

  const { checkRateLimit, recordUploadAttempt } = await import("@uncognito/storage");

  console.log(`${LOG_PREFIX} Checking rate limit | fingerprint=${fingerprint}`);
  const rateLimit = await checkRateLimit(supabase, fingerprint);
  if (!rateLimit.allowed) {
    console.warn(`${LOG_PREFIX} Rate limited | fingerprint=${fingerprint}`);
    await recordUploadAttempt(supabase, {
      fingerprint,
      captureMode: validation.data.captureMode,
      outcome: "rate_limited",
      errorCode: "RATE_LIMITED",
    });

    return NextResponse.json(
      buildErrorResponse(
        "RATE_LIMITED",
        "Too many captures. Try again later.",
        rateLimit.retryAfterSeconds,
      ),
      { status: 429 },
    );
  }

  const { imageBase64, sourceHost, sourceTitle, captureMode, clientTimestamp } = validation.data;
  const publicAppUrl = process.env.PUBLIC_APP_URL || "http://localhost:3000";
  const initialShareStatus = getInitialShareStatus(captureMode);

  console.log(`${LOG_PREFIX} Starting pipeline | captureMode=${captureMode} sourceHost=${sourceHost || "none"} fingerprint=${fingerprint}`);

  const {
    createProcessingRoast,
    uploadRoastImage,
    publishRoast,
    markRoastFailed,
    updateShareStatus,
  } = await import("@uncognito/storage");

  console.log(`${LOG_PREFIX} Step 1/4: Creating processing roast record`);
  const roast = await createProcessingRoast(supabase, {
    sourceHost,
    sourceTitle,
    captureMode,
    clientTimestamp,
  });

  let caption;
  try {
    console.log(`${LOG_PREFIX} Step 2/4: Generating AI caption | roastId=${roast.id}`);
    caption = await generateCaptionFromBase64(imageBase64);
  } catch (error) {
    console.warn(`${LOG_PREFIX} AI caption failed, using fallback | roastId=${roast.id} error=${error.message}`);
    caption = "Caught in the act: productivity left the chat.";
  }

  try {
    console.log(`${LOG_PREFIX} Step 3/4: Uploading image to storage | roastId=${roast.id}`);
    const { imagePath, imageUrl } = await uploadRoastImage(supabase, {
      roastId: roast.id,
      imageBase64,
    });

    console.log(`${LOG_PREFIX} Step 4/4: Publishing roast + updating share status | roastId=${roast.id} shareStatus=${initialShareStatus}`);
    const publishedRoast = await publishRoast(supabase, {
      roastId: roast.id,
      imagePath,
      imageUrl,
      caption,
    });

    await updateShareStatus(supabase, roast.id, initialShareStatus);
    publishedRoast.shareStatus = initialShareStatus;

    await recordUploadAttempt(supabase, {
      fingerprint,
      captureMode,
      outcome: "accepted",
      roastId: roast.id,
    });

    console.log(`${LOG_PREFIX} Upload complete | roastId=${roast.id} publicUrl=${publicAppUrl}/roast/${roast.id}`);

    return NextResponse.json(buildUploadResponse(publishedRoast, publicAppUrl), {
      status: 201,
    });
  } catch (error) {
    console.error(`${LOG_PREFIX} Roast processing failed | roastId=${roast.id} error=${error.message}`, error.stack);
    await markRoastFailed(supabase, roast.id, `Processing failed: ${error.message}`);

    await recordUploadAttempt(supabase, {
      fingerprint,
      captureMode,
      outcome: "failed",
      roastId: roast.id,
      errorCode: "PROCESSING_FAILED",
    });

    return NextResponse.json(
      buildErrorResponse("PROCESSING_FAILED", "Failed to process the roast. Please try again."),
      { status: 500 },
    );
  }
}

function getClientFingerprint(request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return ip;
}

async function generateCaptionFromBase64(imageBase64) {
  const { generateRoastCaption } = await import("@uncognito/ai");
  return generateRoastCaption({
    imageBase64,
  });
}
