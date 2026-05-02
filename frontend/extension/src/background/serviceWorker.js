import { CAPTURE_ALARM_NAME, CAPTURE_MODES } from "../lib/defaults.js";
import { getNextCaptureDelayMs, retryAfterToDelayMs } from "../lib/scheduler.js";
import { getSettings, patchSettings } from "../lib/settings.js";
import { getSourceMetadata, isRestrictedTabUrl } from "../lib/tabs.js";
import { buildUploadPayload, uploadScreenshot } from "../lib/upload.js";

let uploadInFlight = false;

chrome.runtime.onInstalled.addListener(async () => {
  const settings = await getSettings();
  await patchSettings({
    ...settings,
    enabled: false,
    lastStatus: "Disabled",
    nextCaptureAt: null,
  });
  await chrome.alarms.clear(CAPTURE_ALARM_NAME);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  handleMessage(message)
    .then((result) => sendResponse({ ok: true, result }))
    .catch((error) =>
      sendResponse({
        ok: false,
        error: {
          message: error.message,
          code: error.code ?? "EXTENSION_ERROR",
          retryAfterSeconds: error.retryAfterSeconds,
        },
      }),
    );

  return true;
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== CAPTURE_ALARM_NAME) {
    return;
  }

  await captureAndUpload(CAPTURE_MODES.RANDOM, { scheduleAfter: true });
});

async function handleMessage(message) {
  switch (message?.type) {
    case "GET_SETTINGS":
      return getSettings();
    case "UPDATE_SETTINGS":
      return updateSettings(message.patch ?? {});
    case "CAPTURE_NOW":
      return captureAndUpload(message.captureMode ?? CAPTURE_MODES.MANUAL, {
        scheduleAfter: false,
      });
    case "SCHEDULE_NEXT":
      return scheduleNextCapture();
    case "SET_CONSENT":
      await patchSettings({ consented: true });
      return getSettings();
    default:
      throw new Error("Unknown extension message.");
  }
}

async function updateSettings(patch) {
  const settings = await patchSettings(patch);

  if (settings.enabled) {
    await scheduleNextCapture(settings);
  } else {
    await chrome.alarms.clear(CAPTURE_ALARM_NAME);
    await patchSettings({ nextCaptureAt: null, lastStatus: "Disabled" });
  }

  return getSettings();
}

async function captureAndUpload(captureMode, { scheduleAfter }) {
  if (uploadInFlight) {
    throw Object.assign(new Error("Upload already in progress."), { code: "UPLOAD_IN_PROGRESS" });
  }

  const settings = await getSettings();
  if (!settings.enabled && captureMode === CAPTURE_MODES.RANDOM) {
    await patchSettings({ lastStatus: "Skipped because extension is disabled." });
    return { skipped: true };
  }

  uploadInFlight = true;
  await patchSettings({ lastStatus: "Capturing..." });

  try {
    const tab = await getActiveTab();
    if (isRestrictedTabUrl(tab.url)) {
      await patchSettings({ lastStatus: "Skipped restricted browser page." });
      if (scheduleAfter) {
        await scheduleNextCapture(settings);
      }
      return { skipped: true, reason: "RESTRICTED_PAGE" };
    }

    const imageBase64 = await chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" });
    const metadata = getSourceMetadata(tab);
    const payload = buildUploadPayload({
      imageBase64,
      tab: metadata,
      captureMode,
    });

    await patchSettings({ lastStatus: "Uploading..." });
    const upload = await uploadScreenshot({ backendUrl: settings.backendUrl, payload });

    const patch = {
      lastCaptureAt: new Date().toISOString(),
      lastStatus: "Roast created.",
      lastRoastUrl: upload.publicUrl ?? null,
      linkedInShareUrl: upload.linkedInShareUrl ?? null,
    };

    await patchSettings(patch);

    if (scheduleAfter) {
      await scheduleNextCapture(settings);
    }

    return upload;
  } catch (error) {
    const retryDelay = retryAfterToDelayMs(error.retryAfterSeconds);
    await patchSettings({
      lastStatus: getReadableError(error),
    });

    if (scheduleAfter) {
      await scheduleNextCapture(settings, retryDelay);
    }

    throw error;
  } finally {
    uploadInFlight = false;
  }
}

async function scheduleNextCapture(existingSettings, overrideDelayMs = null) {
  const settings = existingSettings ?? (await getSettings());

  if (!settings.enabled) {
    await chrome.alarms.clear(CAPTURE_ALARM_NAME);
    await patchSettings({ nextCaptureAt: null });
    return { nextCaptureAt: null };
  }

  const delayMs = overrideDelayMs ?? getNextCaptureDelayMs(settings.intensity);
  const nextCaptureAt = new Date(Date.now() + delayMs).toISOString();

  await chrome.alarms.create(CAPTURE_ALARM_NAME, { when: Date.now() + delayMs });
  await patchSettings({ nextCaptureAt, lastStatus: "Enabled and waiting." });

  return { nextCaptureAt };
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) {
    throw Object.assign(new Error("No active tab found."), { code: "NO_ACTIVE_TAB" });
  }

  return tab;
}

function getReadableError(error) {
  if (error.code === "RATE_LIMITED") {
    return `Rate limited. Try again in ${error.retryAfterSeconds ?? "a few"} seconds.`;
  }

  return error.message || "Capture failed.";
}
