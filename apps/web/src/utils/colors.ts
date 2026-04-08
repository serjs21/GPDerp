const DEFAULT_LABEL_COLORS = [
  "#1677ff",
  "#13c2c2",
  "#52c41a",
  "#faad14",
  "#eb2f96",
  "#722ed1",
  "#fa541c",
  "#2f54eb",
] as const;

export function getRandomLabelColor(): string {
  const i = Math.floor(Math.random() * DEFAULT_LABEL_COLORS.length);
  return DEFAULT_LABEL_COLORS[i];
}
