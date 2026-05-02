import { DEFAULT_SETTINGS } from "./defaults.js";

export async function getSettings(chromeApi = chrome) {
  const stored = await chromeApi.storage.local.get(DEFAULT_SETTINGS);
  return normalizeSettings(stored);
}

export async function saveSettings(nextSettings, chromeApi = chrome) {
  const settings = normalizeSettings(nextSettings);
  await chromeApi.storage.local.set(settings);
  return settings;
}

export async function patchSettings(patch, chromeApi = chrome) {
  const current = await getSettings(chromeApi);
  return saveSettings({ ...current, ...patch }, chromeApi);
}

export function normalizeSettings(settings) {
  const merged = { ...DEFAULT_SETTINGS, ...(settings ?? {}) };

  return {
    ...merged,
    enabled: Boolean(merged.enabled),
    intensity: ["low", "medium", "high", "demo"].includes(merged.intensity)
      ? merged.intensity
      : DEFAULT_SETTINGS.intensity,
    backendUrl: String(merged.backendUrl || DEFAULT_SETTINGS.backendUrl).trim(),
  };
}
