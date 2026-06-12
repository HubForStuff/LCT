// src/lib/pre-registration/files.mjs
export const MAX_FILE_BYTES = 20 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 35 * 1024 * 1024;

/**
 * @param {{ name: string, size: number }[]} files
 * @returns {{ ok: boolean, error?: string }}
 */
export function validateFileSizes(files) {
  const present = (files || []).filter((f) => f && f.size > 0);
  let total = 0;
  for (const file of present) {
    if (file.size > MAX_FILE_BYTES) {
      return { ok: false, error: `${file.name} exceeds the 20MB per-file limit. Export to PDF or use the deck link field.` };
    }
    total += file.size;
  }
  if (total > MAX_TOTAL_BYTES) {
    return { ok: false, error: "The total size of all attachments is too large (max 35MB). Remove some files or use the deck link field." };
  }
  return { ok: true };
}

/**
 * @param {File} file
 * @param {() => { readAsDataURL: (file: any) => void, onload?: () => void, onerror?: () => void, result?: string, error?: unknown }} [readerImpl]
 * @returns {Promise<string>} base64 without the data-URL prefix
 */
export function fileToBase64(file, readerImpl = () => new FileReader()) {
  return new Promise((resolve, reject) => {
    const reader = readerImpl();
    reader.onload = () => {
      const result = String(reader.result || "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error || new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}
