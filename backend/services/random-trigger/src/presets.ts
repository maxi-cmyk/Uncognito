export type Intensity = "low" | "medium" | "high" | "demo";

export type IntensityPreset = {
  intensity: Intensity;
  meanMs: number;
  minMs: number;
  maxMs: number;
};

const minute = 60_000;

export const INTENSITY_PRESETS: Record<Intensity, IntensityPreset> = {
  low: {
    intensity: "low",
    meanMs: 60 * minute,
    minMs: 10 * minute,
    maxMs: 180 * minute,
  },
  medium: {
    intensity: "medium",
    meanMs: 30 * minute,
    minMs: 5 * minute,
    maxMs: 90 * minute,
  },
  high: {
    intensity: "high",
    meanMs: 10 * minute,
    minMs: 2 * minute,
    maxMs: 30 * minute,
  },
  demo: {
    intensity: "demo",
    meanMs: 45_000,
    minMs: 30_000,
    maxMs: 60_000,
  },
};

export function isIntensity(value: unknown): value is Intensity {
  return (
    value === "low" ||
    value === "medium" ||
    value === "high" ||
    value === "demo"
  );
}

export function getIntensityPreset(intensity: unknown): IntensityPreset {
  return INTENSITY_PRESETS[isIntensity(intensity) ? intensity : "medium"];
}
