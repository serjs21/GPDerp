import type { LabelDto } from "@/api/labels";
import { COMIC_LABEL_NAME_MIN } from "../comicLabelShapes";

type Translate = (key: string, values?: Record<string, number>) => string;

/** Another label (not the one being edited) already uses this name, case-insensitively. */
function nameTaken(labels: LabelDto[], trimmedName: string, editing: LabelDto | undefined): boolean {
  const lowered = trimmedName.toLowerCase();
  return labels.some((l) => l.name.toLowerCase() === lowered && (!editing || l.id !== editing.id));
}

/** Why the label can't be saved yet (shown as the save tooltip), or null when it can. */
export function labelSaveBlockReason(
  t: Translate,
  params: { isLoading: boolean; trimmedName: string; labels: LabelDto[]; editing?: LabelDto },
): string | null {
  const { isLoading, trimmedName, labels, editing } = params;
  if (isLoading) return t("loadingLabels");
  if (trimmedName.length === 0) return t("enterName");
  if (trimmedName.length < COMIC_LABEL_NAME_MIN) return t("nameTooShort", { min: COMIC_LABEL_NAME_MIN });
  if (nameTaken(labels, trimmedName, editing)) return t("alreadyExists");
  return null;
}
