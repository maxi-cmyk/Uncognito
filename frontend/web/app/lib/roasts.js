import { getPublicAppUrl } from "./url.js";

const FALLBACK_ROASTS = [
  {
    id: "demo_youtube",
    caption:
      "You opened YouTube for one quick break and somehow built a full research syllabus in procrastination.",
    imageUrl:
      "https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=1200&q=80",
    sourceHost: "youtube.com",
    createdAt: "2026-05-02T05:35:48.000Z",
    status: "public",
  },
  {
    id: "demo_spotify",
    caption:
      "The playlist is curated, the vibes are immaculate, and the actual task has filed a missing-person report.",
    imageUrl:
      "https://images.unsplash.com/photo-1611339555312-e607c8352fd7?auto=format&fit=crop&w=1200&q=80",
    sourceHost: "open.spotify.com",
    createdAt: "2026-05-02T05:36:12.000Z",
    status: "public",
  },
];

export async function getPublicRoasts() {
  try {
    const baseUrl = getPublicAppUrl();
    const res = await fetch(`${baseUrl}/api/roasts`, { next: { revalidate: 30 } });

    if (!res.ok) throw new Error(`API returned ${res.status}`);

    const data = await res.json();
    return data.roasts || [];
  } catch {
    return FALLBACK_ROASTS;
  }
}

export async function getRoast(id) {
  try {
    const baseUrl = getPublicAppUrl();
    const res = await fetch(`${baseUrl}/api/roasts/${id}`, { next: { revalidate: 30 } });

    if (!res.ok) return null;

    return await res.json();
  } catch {
    return FALLBACK_ROASTS.find((r) => r.id === id) || null;
  }
}

export function formatRoastTime(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
