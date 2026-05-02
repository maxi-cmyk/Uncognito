import { NextResponse } from "next/server";

import { buildErrorResponse } from "@uncognito/shared/contracts";

import { getSupabase } from "../../lib/supabase";

export async function GET(request) {
  const adminToken = request.headers.get("x-admin-token");
  if (adminToken !== process.env.ADMIN_TOKEN || !process.env.ADMIN_TOKEN) {
    return NextResponse.json(
      buildErrorResponse("UNAUTHORIZED", "Valid admin token required."),
      { status: 401 },
    );
  }

  const supabase = await getSupabase();

  try {
    const { listAllRoasts } = await import("@uncognito/storage");
    const result = await listAllRoasts(supabase);
    return NextResponse.json({ roasts: result.roasts });
  } catch (error) {
    console.error("Admin roasts fetch error:", error);
    return NextResponse.json(
      buildErrorResponse("FETCH_FAILED", "Failed to fetch roasts."),
      { status: 500 },
    );
  }
}
