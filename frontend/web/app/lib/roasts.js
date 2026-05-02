export const roasts = [
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
    id: "demo_telegram",
    caption:
      "Nothing says deep work like decoding campus gossip with the intensity of a federal investigation.",
    imageUrl:
      "https://images.unsplash.com/photo-1611606063065-ee7946f0787a?auto=format&fit=crop&w=1200&q=80",
    sourceHost: "web.telegram.org",
    createdAt: "2026-05-02T05:35:11.000Z",
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

export function getPublicRoasts() {
  return roasts.filter((roast) => roast.status === "public");
}

export function getRoast(id) {
  return getPublicRoasts().find((roast) => roast.id === id) ?? null;
}

export function formatRoastTime(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
