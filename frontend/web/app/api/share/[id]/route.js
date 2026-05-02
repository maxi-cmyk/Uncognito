import { NextResponse } from "next/server";

import { buildErrorResponse } from "@uncognito/shared/contracts";

import { getSupabase } from "../../lib/supabase";

export async function POST(_request, { params }) {
  const supabase = await getSupabase();
  const { getRoast, updateShareStatus } = await import("@uncognito/storage");

  const roast = await getRoast(supabase, params.id);

  if (!roast) {
    return NextResponse.json(
      buildErrorResponse("NOT_FOUND", "Roast not found."),
      { status: 404 },
    );
  }

  const updatedRoast = await updateShareStatus(supabase, params.id, "shared");

  const publicAppUrl = process.env.PUBLIC_APP_URL || "http://localhost:3000";
  const publicUrl = `${publicAppUrl}/roast/${updatedRoast.id}`;

  return NextResponse.json({
    ...updatedRoast,
    publicUrl,
  });
}
