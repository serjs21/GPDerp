import type { LabelDto } from "@/api/labels";
import { STORY_ACCOUNT_ID } from "./haiku";

const LABEL_SEEDS: Array<Pick<LabelDto, "name" | "color" | "shape">> = [
  { name: "Nature", color: "#52c41a", shape: "classic" },
  { name: "Morning", color: "#1677ff", shape: "circle" },
  { name: "Philosophy", color: "#722ed1", shape: "thought" },
  { name: "Pond", color: "#13c2c2", shape: "soft" },
  { name: "Zen", color: "#6b8f71", shape: "burst" },
  { name: "Winter", color: "#2f54eb", shape: "classic" },
  { name: "Tea", color: "#ad6800", shape: "circle" },
  { name: "Moon", color: "#faad14", shape: "thought" },
  { name: "Rain", color: "#08979c", shape: "soft" },
  { name: "Temple", color: "#cf1322", shape: "burst" },
  { name: "Autumn", color: "#d46b08", shape: "classic" },
  { name: "Night", color: "#1d39c4", shape: "circle" },
];

/** Twelve account labels (one manage-labels page). */
export const STORY_LABELS: LabelDto[] = LABEL_SEEDS.map((seed, index) => ({
  ...seed,
  id: `00000000-0000-4000-8000-${String(301 + index).padStart(12, "0")}`,
  accountId: STORY_ACCOUNT_ID,
  createdAt: new Date(Date.UTC(2026, 0, 1 + index, 12)).toISOString(),
  connectedHaikus: { total: 0, items: [] },
}));
