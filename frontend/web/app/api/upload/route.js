import { NextResponse } from "next/server";

import { getInitialShareStatus } from "@uncognito/social";
import { buildErrorResponse, buildUploadResponse } from "@uncognito/shared/contracts";
import { validateUploadRequest } from "@uncognito/shared/validation";

import { getSupabase } from "../lib/supabase";

export async function POST(request) {
  try {
    const supabase = await getSupabase();
    return await handleUpload(request, supabase);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      buildErrorResponse("INTERNAL_ERROR", "An unexpected error occurred."),
      { status: 500 },
    );
  }
}

async function handleUpload(request, supabase) {
  const body = await request.json().catch(() => null);
  const validation = validateUploadRequest(body);

  if (!validation.valid) {
    return NextResponse.json(
      buildErrorResponse(validation.error, validation.message),
      { status: 400 },
    );
  }

  const { imageBase64, sourceHost, sourceTitle, captureMode, clientTimestamp } = validation.data;
  const publicAppUrl = process.env.PUBLIC_APP_URL || "http://localhost:3000";

  const initialShareStatus = getInitialShareStatus(captureMode);

  const {
    createProcessingRoast,
    uploadRoastImage,
    publishRoast,
    markRoastFailed,
    updateShareStatus,
  } = await import("@uncognito/storage");

  const roast = await createProcessingRoast(supabase, {
    sourceHost,
    sourceTitle,
    captureMode,
    clientTimestamp,
  });

  let caption;
  try {
    caption = await generateCaptionFromBase64(imageBase64);
  } catch {
    caption = "Caught in the act: productivity left the chat.";
  }

  try {
    const { imagePath, imageUrl } = await uploadRoastImage(supabase, {
      roastId: roast.id,
      imageBase64,
    });

    const publishedRoast = await publishRoast(supabase, {
      roastId: roast.id,
      imagePath,
      imageUrl,
      caption,
    });

    await updateShareStatus(supabase, roast.id, initialShareStatus);
    publishedRoast.shareStatus = initialShareStatus;

    return NextResponse.json(buildUploadResponse(publishedRoast, publicAppUrl), {
      status: 201,
    });
  } catch (error) {
    console.error("Roast processing error:", error);
    await markRoastFailed(supabase, roast.id, `Processing failed: ${error.message}`);
    return NextResponse.json(
      buildErrorResponse("PROCESSING_FAILED", "Failed to process the roast. Please try again."),
      { status: 500 },
    );
  }
}

async function generateCaptionFromBase64(imageBase64) {
  const { generateRoastCaption } = await import("@uncognito/ai");
  return generateRoastCaption({
    imageBase64,
  });
}
