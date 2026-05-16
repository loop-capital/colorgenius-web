/**
 * Generates a client-side device fingerprint for salon device tracking.
 * Combines browser attributes into a unique-ish string, then hashes it.
 */
export function generateFingerprint(): string {
  if (typeof window === "undefined") {
    throw new Error("generateFingerprint must be called from the browser");
  }

  const components = [
    navigator.userAgent,
    `${window.screen.width}x${window.screen.height}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language,
    navigator.platform,
  ];

  const raw = components.join("|");

  // Simple FNV-1a 32-bit hash
  let hash = 0x811c9dc5;
  for (let i = 0; i < raw.length; i++) {
    hash ^= raw.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }

  return hash.toString(16).padStart(8, "0");
}
