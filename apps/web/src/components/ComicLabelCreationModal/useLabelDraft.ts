"use client";

import { useEffect, useRef, useState } from "react";
import type { LabelDto } from "@/api/labels";
import { getRandomLabelColor } from "@/utils/colors";
import { resolveComicLabelShapePreset, type ComicLabelShapeId } from "./comicLabelShapes";

/** Delay so the dialog portal has mounted before focusing the name field. */
const FOCUS_NAME_DELAY_MS = 40;

/**
 * Editable label draft (name, color, shape) plus the color-picker toggle. Reloads from `label` (or a
 * fresh random color) each time the form opens and focuses the name field with the caret at the end.
 */
export function useLabelDraft(open: boolean, label: LabelDto | undefined) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(getRandomLabelColor);
  const [shapeId, setShapeId] = useState<ComicLabelShapeId>("classic");
  const [pickerOpen, setPickerOpen] = useState(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) {
      setPickerOpen(false);
      return;
    }
    setName(label?.name ?? "");
    setColor(label?.color ?? getRandomLabelColor());
    setShapeId(resolveComicLabelShapePreset(label?.shape).id);
    setPickerOpen(false);

    // Focus after dialog portal mounts; caret uses Bangers metrics via matched font styles.
    const timer = window.setTimeout(() => {
      const el = nameInputRef.current;
      if (!el) return;
      el.focus();
      const len = el.value.length;
      el.setSelectionRange(len, len);
    }, FOCUS_NAME_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [open, label]);

  /** Blank draft for the next label after a successful create. */
  const resetForNextLabel = () => {
    setName("");
    setColor(getRandomLabelColor());
    setShapeId("classic");
  };

  return {
    name,
    setName,
    trimmedName: name.trim(),
    color,
    setColor,
    shapeId,
    setShapeId,
    pickerOpen,
    setPickerOpen,
    nameInputRef,
    resetForNextLabel,
  };
}
