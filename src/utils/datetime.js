export const SEGMENT_SECONDS = 300;

export function toDatetimeLocalNow(stepMinute = 5) {
  const now = new Date();
  const minute = Math.floor(now.getMinutes() / stepMinute) * stepMinute;
  now.setMinutes(minute, 0, 0);
  return toDatetimeLocalValue(now);
}

export function toDatetimeLocalValue(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export function parseDatetimeLocal(value) {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function floorToFiveMinute(date) {
  const next = new Date(date);
  next.setSeconds(0, 0);
  next.setMinutes(Math.floor(next.getMinutes() / 5) * 5);
  return next;
}

export function toFilenameTimestamp(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}${mm}${dd}_${hh}${mi}`;
}

export function formatDisplay(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}
