import { NextResponse } from "next/server";

import { getSupabase } from "../lib/supabase";

export async function GET() {
  const supabase = await getSupabase();
  const { listPublicRoasts } = await import("@uncognito/storage");

  const { roasts, total } = await listPublicRoasts(supabase);

  return NextResponse.json({ roasts, total });
}
