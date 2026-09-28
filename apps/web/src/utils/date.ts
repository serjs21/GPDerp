export const formatCreatedAt = (iso: string): string => {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
};

export const formatCreatedOn = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, { dateStyle: "medium" });
};

const MFG_MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

/** Product-stamp date, e.g. `MFG 01 MAY 2024`. Empty string for invalid input. */
export const formatMfgDate = (input: string | Date): string => {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  return `MFG ${day} ${MFG_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

export const formatChatTime = (input: Date | number | string) => {
  const d = new Date(input);
  const now = new Date();

  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  if (sameDay) {
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return d.toLocaleDateString([], {
    month: "short",
    day: "2-digit",
  }) + ", " + d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}