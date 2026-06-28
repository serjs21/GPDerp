export const CELESTIAL_FIXED_DATE = "2023-03-15";
export const CELESTIAL_TIMEZONE_OFFSET = "+07:00";
export const CELESTIAL_MINUTES_STEP = 15;
export const CELESTIAL_SLOTS_PER_DAY = 96;

const SLOT_DEGREES = 360 / CELESTIAL_SLOTS_PER_DAY;

export function clampSlot(slot: number) {
  return Math.min(CELESTIAL_SLOTS_PER_DAY - 1, Math.max(0, Math.round(slot)));
}

export function slotToMinutes(slot: number) {
  return clampSlot(slot) * CELESTIAL_MINUTES_STEP;
}

export function minutesToSlot(totalMinutes: number) {
  const snapped = Math.round(totalMinutes / CELESTIAL_MINUTES_STEP);
  return clampSlot(snapped);
}

export function formatClockLabel(slot: number) {
  const minutes = slotToMinutes(slot);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function slotToDate(slot: number) {
  const label = formatClockLabel(slot);
  return new Date(`${CELESTIAL_FIXED_DATE}T${label}:00${CELESTIAL_TIMEZONE_OFFSET}`);
}

export function dateToSlot(date: Date) {
  const bangkokTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  const [hours, minutes] = bangkokTime.split(":").map(Number);
  return minutesToSlot(hours * 60 + minutes);
}

export function slotToHandDegrees(slot: number) {
  return clampSlot(slot) * SLOT_DEGREES - 90;
}

export function angleToSlot(angleDeg: number) {
  return clampSlot(Math.round((angleDeg + 90) / SLOT_DEGREES));
}

export function isOnFixedCelestialDate(date: Date) {
  const bangkokDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

  return bangkokDate === CELESTIAL_FIXED_DATE;
}
