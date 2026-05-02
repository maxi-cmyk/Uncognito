const RESTRICTED_PROTOCOLS = new Set([
  "chrome:",
  "chrome-extension:",
  "edge:",
  "about:",
  "view-source:",
  "devtools:",
]);

export function isRestrictedTabUrl(url) {
  if (!url || typeof url !== "string") {
    return true;
  }

  try {
    const parsed = new URL(url);
    return RESTRICTED_PROTOCOLS.has(parsed.protocol);
  } catch {
    return true;
  }
}

export function getSourceMetadata(tab) {
  if (!tab?.url || isRestrictedTabUrl(tab.url)) {
    return {
      sourceHost: null,
      sourceTitle: tab?.title ?? null,
    };
  }

  return {
    sourceHost: new URL(tab.url).host,
    sourceTitle: tab.title ?? null,
  };
}
