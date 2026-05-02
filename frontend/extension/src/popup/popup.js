import { CAPTURE_MODES } from "../lib/defaults.js";

const elements = {
  enabledInput: document.querySelector("#enabledInput"),
  backendUrlInput: document.querySelector("#backendUrlInput"),
  intensityInput: document.querySelector("#intensityInput"),
  statusText: document.querySelector("#statusText"),
  lastCaptureText: document.querySelector("#lastCaptureText"),
  nextCaptureText: document.querySelector("#nextCaptureText"),
  roastNowButton: document.querySelector("#roastNowButton"),
  linkedInButton: document.querySelector("#linkedInButton"),
  linksSection: document.querySelector("#linksSection"),
  roastLink: document.querySelector("#roastLink"),
  linkedInLink: document.querySelector("#linkedInLink"),
};

document.addEventListener("DOMContentLoaded", hydrate);
elements.enabledInput.addEventListener("change", updateSettingsFromForm);
elements.backendUrlInput.addEventListener("change", updateSettingsFromForm);
elements.intensityInput.addEventListener("change", updateSettingsFromForm);
elements.roastNowButton.addEventListener("click", () => capture(CAPTURE_MODES.MANUAL));
elements.linkedInButton.addEventListener("click", () => capture(CAPTURE_MODES.LINKEDIN_LINK));

async function hydrate() {
  const settings = await sendMessage({ type: "GET_SETTINGS" });
  render(settings);
}

async function updateSettingsFromForm() {
  setBusy(true);
  try {
    const settings = await sendMessage({
      type: "UPDATE_SETTINGS",
      patch: {
        enabled: elements.enabledInput.checked,
        backendUrl: elements.backendUrlInput.value,
        intensity: elements.intensityInput.value,
      },
    });
    render(settings);
  } catch (error) {
    elements.statusText.textContent = error.message;
  } finally {
    setBusy(false);
  }
}

async function capture(captureMode) {
  setBusy(true);
  elements.statusText.textContent = "Capturing...";

  try {
    const upload = await sendMessage({ type: "CAPTURE_NOW", captureMode });
    const settings = await sendMessage({ type: "GET_SETTINGS" });
    render(settings);

    if (upload?.publicUrl) {
      elements.statusText.textContent = "Roast created.";
    }
  } catch (error) {
    elements.statusText.textContent = error.message;
  } finally {
    setBusy(false);
  }
}

function render(settings) {
  elements.enabledInput.checked = settings.enabled;
  elements.backendUrlInput.value = settings.backendUrl;
  elements.intensityInput.value = settings.intensity;
  elements.statusText.textContent = settings.lastStatus;
  elements.lastCaptureText.textContent = formatDate(settings.lastCaptureAt) ?? "Never";
  elements.nextCaptureText.textContent = formatDate(settings.nextCaptureAt) ?? "Not scheduled";

  const hasRoastLink = Boolean(settings.lastRoastUrl);
  const hasLinkedInLink = Boolean(settings.linkedInShareUrl);

  elements.linksSection.hidden = !hasRoastLink && !hasLinkedInLink;
  elements.roastLink.hidden = !hasRoastLink;
  elements.roastLink.href = settings.lastRoastUrl ?? "#";
  elements.linkedInLink.hidden = !hasLinkedInLink;
  elements.linkedInLink.href = settings.linkedInShareUrl ?? "#";
}

function setBusy(isBusy) {
  elements.roastNowButton.disabled = isBusy;
  elements.linkedInButton.disabled = isBusy;
  elements.enabledInput.disabled = isBusy;
  elements.backendUrlInput.disabled = isBusy;
  elements.intensityInput.disabled = isBusy;
}

function sendMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      if (!response?.ok) {
        reject(new Error(response?.error?.message ?? "Extension request failed."));
        return;
      }

      resolve(response.result);
    });
  });
}

function formatDate(value) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}
