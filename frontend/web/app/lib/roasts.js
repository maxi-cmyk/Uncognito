import { readdir } from "node:fs/promises";
import { extname, join, parse } from "node:path";

import { getPublicAppUrl } from "./url.js";

const DEMO_ROASTS_DIR = join(process.cwd(), "public", "demo-roasts");
const DEMO_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const DEMO_CAPTIONS = {
  "telegram-confess": {
    caption:
      "Opened Telegram for one message and accidentally enrolled in a full-time campus drama seminar.",
    sourceHost: "web.telegram.org",
    createdAt: "2026-05-02T07:19:48.000Z",
  },
  "youtube-home": {
    caption:
      "YouTube said one quick video, and your homepage assembled a committee to destroy your attention span.",
    sourceHost: "youtube.com",
    createdAt: "2026-05-02T07:20:09.000Z",
  },
};

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
  const demoRoasts = await getDemoRoasts();

  try {
    const baseUrl = getPublicAppUrl();
    const res = await fetch(`${baseUrl}/api/roasts`, { next: { revalidate: 30 } });

    if (!res.ok) throw new Error(`API returned ${res.status}`);

    const data = await res.json();
    return mergeRoasts(demoRoasts, data.roasts || []);
  } catch {
    return demoRoasts.length ? demoRoasts : FALLBACK_ROASTS;
  }
}

export async function getRoast(id) {
  const demoRoast = (await getDemoRoasts()).find((r) => r.id === id);
  if (demoRoast) {
    return demoRoast;
  }

  try {
    const baseUrl = getPublicAppUrl();
    const res = await fetch(`${baseUrl}/api/roasts/${id}`, { next: { revalidate: 30 } });

    if (!res.ok) return null;

    return await res.json();
  } catch {
    return FALLBACK_ROASTS.find((r) => r.id === id) || null;
  }
}

export async function getDemoRoasts(directory = DEMO_ROASTS_DIR) {
  try {
    const files = await readdir(directory);
    return files
      .filter((fileName) => DEMO_IMAGE_EXTENSIONS.has(extname(fileName).toLowerCase()))
      .sort()
      .map((fileName, index) => buildDemoRoast(fileName, index));
  } catch {
    return [];
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

function buildDemoRoast(fileName, index) {
  const slug = parse(fileName).name;
  const configured = DEMO_CAPTIONS[slug] ?? {};

  return {
    id: `demo_${slug}`,
    caption: configured.caption ?? `Caught live: ${slug.replaceAll("-", " ")} made it to the Wall of Shame.`,
    imageUrl: `/demo-roasts/${fileName}`,
    sourceHost: configured.sourceHost ?? "local screenshot",
    createdAt: configured.createdAt ?? new Date(Date.UTC(2026, 4, 2, 7, 20 + index)).toISOString(),
    status: "public",
  };
}

function mergeRoasts(localRoasts, remoteRoasts) {
  const seen = new Set();
  return [...localRoasts, ...remoteRoasts].filter((roast) => {
    if (seen.has(roast.id)) {
      return false;
    }

    seen.add(roast.id);
    return true;
  });
}
