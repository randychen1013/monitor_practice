import { normalizeRoot, VIDEO_CONFIG } from "../config/video";

function parseStamp(stamp) {
  const m = /^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})$/.exec(stamp);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m;
  return new Date(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h),
    Number(mi),
    0,
    0,
  );
}

function toStamp(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}${mm}${dd}_${hh}${mi}`;
}

const modules = {
  ...import.meta.glob("/*/*.webm", { eager: true, import: "default" }),
  ...import.meta.glob("/*/*/*.webm", { eager: true, import: "default" }),
};

const catalog = {};

Object.entries(modules).forEach(([path, url]) => {
  const segments = path.split("/").filter(Boolean);
  if (segments.length < 2) return;

  const filename = segments[segments.length - 1];
  const cameraSegment = segments[segments.length - 2];
  const rootSegments = segments.slice(0, -2);
  const rootPath = rootSegments.length ? `/${rootSegments.join("/")}` : "/";

  const cameraId = Number(cameraSegment);
  const stampMatch = /^(\d{8}_\d{4})\.webm$/i.exec(filename);
  if (!Number.isFinite(cameraId) || !stampMatch) return;

  const stamp = stampMatch[1];
  const date = parseStamp(stamp);
  if (!date) return;

  const key = `${rootPath}:${cameraId}`;
  if (!catalog[key]) catalog[key] = [];
  catalog[key].push({ url, stamp, date, rootPath });
});

Object.values(catalog).forEach((list) => {
  list.sort((a, b) => a.date.getTime() - b.date.getTime());
});

export function findLocalVideo(cameraId, targetDate) {
  const activeRoot = normalizeRoot(VIDEO_CONFIG.localVideoRoot);
  const list = catalog[`${activeRoot}:${cameraId}`] || [];
  if (!list.length) return null;

  const targetStamp = toStamp(targetDate);
  const exact = list.find((item) => item.stamp === targetStamp);
  if (exact) {
    return { ...exact, isExact: true };
  }

  let nearest = list[0];
  let nearestDistance = Math.abs(list[0].date.getTime() - targetDate.getTime());

  for (let i = 1; i < list.length; i += 1) {
    const distance = Math.abs(list[i].date.getTime() - targetDate.getTime());
    if (distance < nearestDistance) {
      nearest = list[i];
      nearestDistance = distance;
    }
  }

  return { ...nearest, isExact: false };
}

export function findLocalVideoExact(cameraId, targetDate) {
  const activeRoot = normalizeRoot(VIDEO_CONFIG.localVideoRoot);
  const list = catalog[`${activeRoot}:${cameraId}`] || [];
  if (!list.length) return null;

  const targetStamp = toStamp(targetDate);
  const exact = list.find((item) => item.stamp === targetStamp);
  return exact ? { ...exact, isExact: true } : null;
}
