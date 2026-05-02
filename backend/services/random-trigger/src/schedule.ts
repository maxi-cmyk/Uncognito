import {
  ALARM_NAME,
  CHROME_MIN_ALARM_DELAY_MS,
  toChromeDelayInMinutes,
} from "./chrome-alarm.ts";
import { getNextCaptureDelayMs, type RandomSource } from "./exponential.ts";
import type { Intensity } from "./presets.ts";

export type CaptureOutcome =
  | { type: "success" }
  | { type: "skipped"; reason: "restricted_page" | "disabled" | "upload_in_flight" }
  | { type: "recoverable_error"; code: string }
  | { type: "rate_limited"; retryAfterSeconds: number };

export type ScheduleReason =
  | "initial"
  | "success"
  | "skipped"
  | "recoverable_error"
  | "rate_limited"
  | "startup_reconcile";

export type AlarmSchedule = {
  alarmName: typeof ALARM_NAME;
  delayMs: number;
  delayInMinutes: number;
  scheduledFor: string;
  reason: ScheduleReason;
};

export type NextScheduleInput = {
  intensity: Intensity | string;
  outcome?: CaptureOutcome;
  reason?: Extract<ScheduleReason, "initial" | "startup_reconcile">;
  nowMs?: number;
  random?: RandomSource;
};

function reasonFromOutcome(outcome: CaptureOutcome | undefined): ScheduleReason {
  if (!outcome) {
    return "success";
  }

  switch (outcome.type) {
    case "success":
      return "success";
    case "skipped":
      return "skipped";
    case "recoverable_error":
      return "recoverable_error";
    case "rate_limited":
      return "rate_limited";
  }
}

function retryDelayMs(retryAfterSeconds: number): number {
  if (!Number.isFinite(retryAfterSeconds)) {
    return CHROME_MIN_ALARM_DELAY_MS;
  }

  return Math.max(retryAfterSeconds * 1000, CHROME_MIN_ALARM_DELAY_MS);
}

function delayFromOutcome(input: NextScheduleInput): number | null {
  if (input.outcome?.type === "skipped" && input.outcome.reason === "disabled") {
    return null;
  }

  if (input.outcome?.type === "rate_limited") {
    return retryDelayMs(input.outcome.retryAfterSeconds);
  }

  return getNextCaptureDelayMs({
    intensity: input.intensity,
    random: input.random,
  });
}

export function getNextSchedule(input: NextScheduleInput): AlarmSchedule | null {
  const delayMs = delayFromOutcome(input);

  if (delayMs === null) {
    return null;
  }

  const nowMs = input.nowMs ?? Date.now();
  const reason = input.reason ?? reasonFromOutcome(input.outcome);

  return {
    alarmName: ALARM_NAME,
    delayMs,
    delayInMinutes: toChromeDelayInMinutes(delayMs),
    scheduledFor: new Date(nowMs + delayMs).toISOString(),
    reason,
  };
}
