import { getIntensityPreset, type Intensity, type IntensityPreset } from "./presets.ts";

export type RandomSource = () => number;

export type NextDelayInput = {
  intensity: Intensity | string;
  random?: RandomSource;
};

const minRandom = 1e-12;
const maxRandom = 1 - minRandom;

export function normalizeRandomValue(value: number): number {
  if (!Number.isFinite(value)) {
    return 0.5;
  }

  return Math.min(maxRandom, Math.max(minRandom, value));
}

export function sampleExponentialDelayMs({
  intensity,
  random = Math.random,
}: NextDelayInput): number {
  const preset = getIntensityPreset(intensity);
  const u = normalizeRandomValue(random());
  const lambda = 1 / preset.meanMs;

  return Math.round(-Math.log(u) / lambda);
}

export function clampDelayMs(delayMs: number, preset: IntensityPreset): number {
  if (!Number.isFinite(delayMs)) {
    return preset.maxMs;
  }

  return Math.min(preset.maxMs, Math.max(preset.minMs, delayMs));
}

export function getNextCaptureDelayMs(input: NextDelayInput): number {
  const preset = getIntensityPreset(input.intensity);
  const delayMs = sampleExponentialDelayMs(input);

  return clampDelayMs(delayMs, preset);
}
