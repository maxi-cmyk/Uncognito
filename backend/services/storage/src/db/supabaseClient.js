/**
 * Create a Supabase client using service role key for backend mutations.
 * @param {string} supabaseUrl
 * @param {string} serviceRoleKey
 * @returns {Promise<import("@supabase/supabase-js").SupabaseClient>}
 */
export async function createSupabaseClient(supabaseUrl, serviceRoleKey) {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
