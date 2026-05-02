export const ALARM_NAME = "uncognito.random-capture" as const;
export const CHROME_MIN_ALARM_DELAY_MS = 30_000;

export function toChromeDelayInMinutes(delayMs: number): number {
  const safeDelayMs = Number.isFinite(delayMs) ? delayMs : CHROME_MIN_ALARM_DELAY_MS;
  return Math.max(safeDelayMs, CHROME_MIN_ALARM_DELAY_MS) / 60_000;
}
