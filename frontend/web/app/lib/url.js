/**
 * Get the public app URL for server-side API calls.
 * Uses PUBLIC_APP_URL env var in production, falls back to localhost.
 * @returns {string}
 */
export function getPublicAppUrl() {
  if (process.env.PUBLIC_APP_URL) return process.env.PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
