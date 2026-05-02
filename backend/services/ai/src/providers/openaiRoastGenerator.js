import { ROAST_SYSTEM_PROMPT, ROAST_USER_PROMPT } from "../prompts/roastPrompt.js";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-4.1-mini";
const DEFAULT_FALLBACK_CAPTION =
  "Caught in the act: productivity left the chat and the browser tabs held a meeting.";

export class RoastGenerationError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "RoastGenerationError";
    this.cause = options.cause;
  }
}

export async function generateRoastCaption(options) {
  const {
    imageBase64,
    apiKey = readEnv("OPENAI_API_KEY"),
    model = readEnv("OPENAI_VISION_MODEL") ?? DEFAULT_MODEL,
    fetchImpl = globalThis.fetch,
    systemPrompt = ROAST_SYSTEM_PROMPT,
    userPrompt = ROAST_USER_PROMPT,
    fallbackCaption = DEFAULT_FALLBACK_CAPTION,
  } = options ?? {};

  validateImageDataUrl(imageBase64);

  if (!apiKey) {
    console.warn("[ai] No OPENAI_API_KEY set. Returning fallback caption.");
    return fallbackCaption;
  }

  if (typeof fetchImpl !== "function") {
    throw new RoastGenerationError("No fetch implementation available for OpenAI request.");
  }

  console.log(`[ai] Requesting roast caption | model=${model} imageSize=${imageBase64.length} chars`);

  try {
    const response = await fetchImpl(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildResponsesRequest({ model, imageBase64, systemPrompt, userPrompt })),
    });

    if (!response.ok) {
      const errorBody = await safeReadText(response);
      console.error(`[ai] OpenAI request failed | status=${response.status} body=${errorBody.slice(0, 200)}`);
      throw new RoastGenerationError(`OpenAI request failed with ${response.status}: ${errorBody}`);
    }

    const payload = await response.json();
    const caption = normalizeCaption(extractCaptionText(payload), fallbackCaption);
    console.log(`[ai] Caption generated | caption=${caption}`);
    return caption;
  } catch (error) {
    if (error instanceof RoastGenerationError) {
      throw error;
    }

    console.error(`[ai] Unexpected error during roast generation | error=${error.message}`);
    throw new RoastGenerationError("OpenAI roast generation failed.", { cause: error });
  }
}

export function buildResponsesRequest({ model, imageBase64, systemPrompt, userPrompt }) {
  return {
    model,
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: systemPrompt }],
      },
      {
        role: "user",
        content: [
          { type: "input_text", text: userPrompt },
          { type: "input_image", image_url: imageBase64 },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "roast_result",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            caption: {
              type: "string",
              maxLength: 220,
            },
          },
          required: ["caption"],
        },
      },
    },
  };
}

export function normalizeCaption(rawText, fallbackCaption = DEFAULT_FALLBACK_CAPTION) {
  const parsedCaption = parseCaption(rawText);
  const caption = parsedCaption.replace(/\s+/g, " ").trim();

  if (!caption) {
    return fallbackCaption;
  }

  return caption.length > 220 ? `${caption.slice(0, 217).trimEnd()}...` : caption;
}

function parseCaption(rawText) {
  if (typeof rawText !== "string") {
    return "";
  }

  try {
    const parsed = JSON.parse(rawText);
    return typeof parsed.caption === "string" ? parsed.caption : "";
  } catch {
    return rawText;
  }
}

function extractCaptionText(payload) {
  if (typeof payload?.output_text === "string") {
    return payload.output_text;
  }

  for (const output of payload?.output ?? []) {
    for (const content of output?.content ?? []) {
      if (typeof content?.text === "string") {
        return content.text;
      }
    }
  }

  return "";
}

function validateImageDataUrl(imageBase64) {
  if (typeof imageBase64 !== "string" || !imageBase64.startsWith("data:image/")) {
    throw new RoastGenerationError("imageBase64 must be a data:image/* base64 URL.");
  }
}

async function safeReadText(response) {
  try {
    return await response.text();
  } catch {
    return "unreadable response body";
  }
}

function readEnv(name) {
  return globalThis.process?.env?.[name];
}
