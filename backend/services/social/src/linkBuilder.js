const LINKEDIN_SHARE_BASE = "https://www.linkedin.com/sharing/share-offsite/";

/**
 * Generate a LinkedIn share URL for a roast page.
 * @param {string} publicUrl - Full public URL of the roast page
 * @param {string} [caption] - Optional roast caption for summary
 * @returns {string} LinkedIn share-offsite URL
 */
export function generateLinkedInShareUrl(publicUrl, caption) {
  const params = new URLSearchParams();
  params.set("url", publicUrl);

  if (caption) {
    params.set("title", "Uncognito caught a roast");
    params.set("summary", caption);
  }

  return `${LINKEDIN_SHARE_BASE}?${params.toString()}`;
}

/**
 * Extract just the roast URL from a LinkedIn share URL.
 * @param {string} linkedInShareUrl
 * @returns {string | null}
 */
export function extractRoastUrl(linkedInShareUrl) {
  try {
    const url = new URL(linkedInShareUrl);
    return url.searchParams.get("url");
  } catch {
    return null;
  }
}
