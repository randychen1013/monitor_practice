export const VIDEO_CONFIG = {
  // Local demo root. Examples: '/', '/videos', '/records'.
  localVideoRoot: "/",
};

export function normalizeRoot(root) {
  if (!root) return "/";
  let normalized = String(root).trim();
  if (!normalized.startsWith("/")) normalized = `/${normalized}`;
  normalized = normalized.replace(/\/+$/, "");
  return normalized || "/";
}
