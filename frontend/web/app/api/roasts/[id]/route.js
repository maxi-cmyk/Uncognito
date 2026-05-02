import { NextResponse } from "next/server";

import { buildErrorResponse } from "@uncognito/shared/contracts";

import { getSupabase } from "../../lib/supabase";

export async function GET(_request, { params }) {
  const supabase = await getSupabase();
  const { getPublicRoast } = await import("@uncognito/storage");

  const roast = await getPublicRoast(supabase, params.id);

  if (!roast) {
    return NextResponse.json(
      buildErrorResponse("NOT_FOUND", "Roast not found."),
      { status: 404 },
    );
  }

  return NextResponse.json(roast);
}

export async function PATCH(request, { params }) {
  const adminToken = request.headers.get("x-admin-token");
  if (adminToken !== process.env.ADMIN_TOKEN || !process.env.ADMIN_TOKEN) {
    return NextResponse.json(
      buildErrorResponse("UNAUTHORIZED", "Valid admin token required."),
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);

  if (!body || !body.action) {
    return NextResponse.json(
      buildErrorResponse("INVALID_REQUEST", "action field is required."),
      { status: 400 },
    );
  }

  const supabase = await getSupabase();
  const { hideRoast } = await import("@uncognito/storage");

  if (body.action === "hide") {
    const roast = await hideRoast(supabase, params.id);
    return NextResponse.json(roast);
  }

  return NextResponse.json(
    buildErrorResponse("INVALID_ACTION", `Unknown action: ${body.action}.`),
    { status: 400 },
  );
}

export async function DELETE(request, { params }) {
  const adminToken = request.headers.get("x-admin-token");
  if (adminToken !== process.env.ADMIN_TOKEN || !process.env.ADMIN_TOKEN) {
    return NextResponse.json(
      buildErrorResponse("UNAUTHORIZED", "Valid admin token required."),
      { status: 401 },
    );
  }

  const supabase = await getSupabase();
  const { getRoast, deleteRoast, deleteRoastImage } = await import("@uncognito/storage");

  const roast = await getRoast(supabase, params.id);
  if (!roast) {
    return NextResponse.json(
      buildErrorResponse("NOT_FOUND", "Roast not found."),
      { status: 404 },
    );
  }

  await deleteRoast(supabase, params.id);

  if (roast.imagePath) {
    try {
      await deleteRoastImage(supabase, roast.imagePath);
    } catch (error) {
      console.error(`Failed to delete roast image for ${params.id}:`, error.message);
    }
  }

  return NextResponse.json({ success: true });
}
