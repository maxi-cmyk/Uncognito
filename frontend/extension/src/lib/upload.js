export function buildUploadUrl(backendUrl) {
  const base = String(backendUrl ?? "").trim().replace(/\/+$/, "");
  if (!base) {
    throw new Error("Backend URL is required.");
  }

  return `${base}/api/upload`;
}

export function buildUploadPayload({ imageBase64, tab, captureMode, timestamp = new Date() }) {
  const { sourceHost, sourceTitle } = tab;

  return {
    imageBase64,
    sourceHost,
    sourceTitle,
    captureMode,
    clientTimestamp: timestamp.toISOString(),
  };
}

export async function uploadScreenshot({ backendUrl, payload, fetchImpl = fetch }) {
  const response = await fetchImpl(buildUploadUrl(backendUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await readJsonBody(response);

  if (!response.ok) {
    const error = new Error(body?.message ?? `Upload failed with ${response.status}`);
    error.code = body?.error ?? "UPLOAD_FAILED";
    error.retryAfterSeconds = body?.retryAfterSeconds;
    throw error;
  }

  return body;
}

async function readJsonBody(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
