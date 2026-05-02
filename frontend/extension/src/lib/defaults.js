export const DEFAULT_SETTINGS = Object.freeze({
  enabled: false,
  consented: false,
  intensity: "demo",
  backendUrl: "http://localhost:3000",
  lastCaptureAt: null,
  nextCaptureAt: null,
  lastStatus: "Disabled",
  lastRoastUrl: null,
  linkedInShareUrl: null,
});

export const CAPTURE_ALARM_NAME = "uncognito:capture";

export const CAPTURE_MODES = Object.freeze({
  MANUAL: "manual",
  RANDOM: "random",
  LINKEDIN_LINK: "demo_linkedin_link",
});
