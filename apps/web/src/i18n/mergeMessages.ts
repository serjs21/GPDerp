export type Messages = { [key: string]: string | Messages };

const isMessages = (value: unknown): value is Messages =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Deep-merges `overrides` onto `base`; keys missing from `overrides` keep the `base` value. */
export function mergeMessages(base: Messages, overrides: Messages): Messages {
  const merged: Messages = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    const baseValue = merged[key];
    merged[key] = isMessages(baseValue) && isMessages(value) ? mergeMessages(baseValue, value) : value;
  }
  return merged;
}
