import { CAPTURE_MODES } from "../lib/defaults.js";

const elements = {
  enabledInput: document.querySelector("#enabledInput"),
  intensityInput: document.querySelector("#intensityInput"),
  statusText: document.querySelector("#statusText"),
  lastCaptureText: document.querySelector("#lastCaptureText"),
  nextCaptureText: document.querySelector("#nextCaptureText"),
  roastNowButton: document.querySelector("#roastNowButton"),
  openSiteButton: document.querySelector("#openSiteButton"),
};

document.addEventListener("DOMContentLoaded", hydrate);
elements.enabledInput.addEventListener("change", updateSettingsFromForm);
elements.intensityInput.addEventListener("change", updateSettingsFromForm);
elements.roastNowButton.addEventListener("click", () => capture());
elements.openSiteButton.addEventListener("click", openSite);

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

async function capture() {
  setBusy(true);
  elements.statusText.textContent = "Capturing...";

  try {
    const upload = await sendMessage({ type: "CAPTURE_NOW", captureMode: CAPTURE_MODES.MANUAL });
    const settings = await sendMessage({ type: "GET_SETTINGS" });
    render(settings);

    // Auto-open LinkedIn share after roast is created
    if (upload?.linkedInShareUrl) {
      elements.statusText.textContent = "Roast created — opening LinkedIn...";
      chrome.tabs.create({ url: upload.linkedInShareUrl });
    } else if (upload?.publicUrl) {
      elements.statusText.textContent = "Roast created.";
    }

    // Glow the site button after successful roast
    const btn = elements.openSiteButton;
    btn.classList.remove("glowing");
    void btn.offsetWidth;
    btn.classList.add("glowing");
    btn.addEventListener("animationend", () => btn.classList.remove("glowing"), { once: true });
  } catch (error) {
    elements.statusText.textContent = error.message;
  } finally {
    setBusy(false);
  }
}

async function openSite() {
  const settings = await sendMessage({ type: "GET_SETTINGS" });
  const url = settings.backendUrl || "http://localhost:3000";
  chrome.tabs.create({ url });
}

function render(settings) {
  elements.enabledInput.checked = settings.enabled;
  elements.intensityInput.value = settings.intensity;
  elements.statusText.textContent = settings.lastStatus;
  elements.lastCaptureText.textContent = formatDate(settings.lastCaptureAt) ?? "Never";
  elements.nextCaptureText.textContent = formatDate(settings.nextCaptureAt) ?? "Not scheduled";
}

function setBusy(isBusy) {
  elements.roastNowButton.disabled = isBusy;
  elements.openSiteButton.disabled = isBusy;
  elements.enabledInput.disabled = isBusy;
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
