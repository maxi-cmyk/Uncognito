import { readFile } from "node:fs/promises";
import { extname } from "node:path";

const MIME_BY_EXTENSION = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
]);

export async function imageFileToDataUrl(filePath) {
  const extension = extname(filePath).toLowerCase();
  const mimeType = MIME_BY_EXTENSION.get(extension);

  if (!mimeType) {
    throw new Error(`Unsupported image fixture extension: ${extension}`);
  }

  const image = await readFile(filePath);
  return `data:${mimeType};base64,${image.toString("base64")}`;
}
