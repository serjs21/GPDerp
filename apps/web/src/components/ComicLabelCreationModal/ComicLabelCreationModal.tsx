"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { HexColorPicker } from "react-colorful";
import type { LabelDto } from "@/api/labels";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { ComicModalInput } from "@/components/ComicModalInput";
import {
  ComicPageDialog,
  ComicPagePanel,
  ComicPageRow,
} from "@/components/ComicPageLayout";
import { comicToast } from "@/components/ComicToast";
import { Tooltip } from "@/components/StyledComponents";
import { useAccountLabels } from "@/hooks/useAccountLabels";
import { getRandomLabelColor } from "@/utils/colors";
import {
  COMIC_LABEL_NAME_MAX,
  COMIC_LABEL_NAME_MIN,
  COMIC_LABEL_SHAPE_PRESETS,
  COMIC_LABEL_SHAPE_PREVIEW_TEXT,
  resolveComicLabelShapePreset,
  type ComicLabelShapeId,
} from "./comicLabelShapes";
import { isFineLabelText } from "./utils/isFineLabelText";
import styles from "./ComicLabelCreationModal.module.css";

const BRUSH_SRC = "/brush/brush-paint-repair.svg";
const FINE_DOG_SRC = "/thisisfine.svg";
const SAVE_DISABLED_FILL = "#9e9e9e";

export type ComicLabelCreationModalProps = {
  open: boolean;
  accountId: string;
  label?: LabelDto;
  onClose: () => void;
  onCreated?: (label: LabelDto) => void;
  onUpdated?: (label: LabelDto) => void;
  /**
   * When true, render the form body only (no outer ComicPageDialog).
   * Parent controls visibility with `open` and owns the dialog shell.
   */
  embedded?: boolean;
  className?: string;
};

export function ComicLabelCreationModal({
  open,
  accountId,
  label,
  onClose,
  onCreated,
  onUpdated,
  embedded = false,
  className,
}: ComicLabelCreationModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(getRandomLabelColor);
  const [shapeId, setShapeId] = useState<ComicLabelShapeId>("classic");
  const [pickerOpen, setPickerOpen] = useState(false);
  const colorShellRef = useRef<HTMLDivElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const { labels, isLoading, createLabel, updateLabel, isCreating, isUpdating } = useAccountLabels({
    accountId,
    autofetch: open,
  });

  const trimmedName = name.trim();
  const shape = resolveComicLabelShapePreset(shapeId);
  const previewText =
    trimmedName.length > 0 ? formatComicLabelText(trimmedName) : formatComicLabelText("__");
  const saveText = formatComicLabelText(label ? "Save" : "Create");
  const previewBackground = isFineLabelText(trimmedName) ? "fine" : "solid";

  const isShort = trimmedName.length > 0 && trimmedName.length < COMIC_LABEL_NAME_MIN;
  const exists = labels.some(
    (l) =>
      l.name.toLowerCase() === trimmedName.toLowerCase() &&
      (!label || l.id !== label.id),
  );
  const disabledReason = isLoading
    ? "Loading labels..."
    : trimmedName.length === 0
      ? "Enter a label name"
      : isShort
        ? `Name should be at least ${COMIC_LABEL_NAME_MIN} characters`
        : exists
          ? "Label already exists in this account"
          : null;
  const canSave = !disabledReason && !isCreating && !isUpdating;
  const busy = isCreating || isUpdating;

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
    }, 40);
    return () => window.clearTimeout(timer);
  }, [open, label]);

  useEffect(() => {
    if (!pickerOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const root = colorShellRef.current;
      if (!root) return;
      if (event.target instanceof Node && root.contains(event.target)) return;
      setPickerOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [pickerOpen]);

  const colorPanelStyle = useMemo(
    () =>
      ({
        "--comic-panel-base": color,
      }) as CSSProperties,
    [color],
  );

  const submit = () => {
    if (disabledReason) return;
    if (label) {
      void updateLabel({
        labelId: label.id,
        name: trimmedName,
        color,
        shape: shapeId,
        onSuccess: async (updated) => {
          comicToast.success("Label updated");
          onUpdated?.(updated);
          onClose();
        },
        onError: async () => {
          comicToast.error("Could not update label");
        },
      });
      return;
    }
    void createLabel({
      name: trimmedName,
      color,
      shape: shapeId,
      onSuccess: async (created) => {
        comicToast.success("Label created");
        onCreated?.(created);
        setName("");
        setColor(getRandomLabelColor());
        setShapeId("classic");
        // Embedded hubs keep the shell open (e.g. switch to Add); standalone closes.
        if (!embedded) onClose();
      },
      onError: async () => {
        comicToast.error("Could not create label");
      },
    });
  };

  const openPicker = (event: MouseEvent) => {
    event.stopPropagation();
    setPickerOpen(true);
  };

  const body = (
    <div className={[styles.body, embedded ? styles.bodyEmbedded : "", className].filter(Boolean).join(" ")}>
      <ComicPageRow columns="2fr-1fr" className={styles.topRow}>
        <ComicPagePanel
          background={previewBackground}
          color="white"
          contentAlign="center"
          className={styles.previewPanel}
          title="This is"
          footer={
            trimmedName.length >= 0 && trimmedName.length < COMIC_LABEL_NAME_MIN
              ? `Min ${COMIC_LABEL_NAME_MIN} chars`
              : undefined
          }
        >
          <div className={styles.previewStage}>
            <div className={styles.burstWrap}>
              <ComicBurstLabel
                text={previewText}
                fill={color}
                shapeKind={shape.kind}
                spikeCount={shape.spikeCount}
                randomness={shape.randomness}
                seed={shape.id}
              />
              <ComicModalInput
                ref={nameInputRef}
                className={styles.previewInput}
                value={name}
                maxLength={COMIC_LABEL_NAME_MAX}
                aria-label="Label name"
                placeholder=""
                autoComplete="off"
                spellCheck={false}
                onChange={(e) => setName(e.target.value.slice(0, COMIC_LABEL_NAME_MAX))}
              />
            </div>
          </div>
        </ComicPagePanel>

        <div ref={colorShellRef} className={styles.colorShell}>
          <ComicPagePanel
            title={
              pickerOpen ? undefined : (
                <span className={styles.colorTitle}>
                  Color
                  {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG asset */}
                  <img
                    className={styles.fineDog}
                    src={FINE_DOG_SRC}
                    alt=""
                    draggable={false}
                    aria-hidden
                  />
                </span>
              )
            }
            background="solid"
            color="white"
            overflowVisible
            contentAlign="center"
            className={[styles.colorPanel, pickerOpen ? styles.colorPanelOpen : ""]
              .filter(Boolean)
              .join(" ")}
            ariaLabel="Label color"
            style={colorPanelStyle}
          >
            {pickerOpen ? null : (
              <button
                type="button"
                className={styles.colorBody}
                onClick={openPicker}
                aria-label="Open color picker"
              >
                <span className={styles.brushPad}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG asset */}
                  <img className={styles.brush} src={BRUSH_SRC} alt="" draggable={false} />
                </span>
              </button>
            )}
          </ComicPagePanel>
          {pickerOpen ? (
            <div
              className={styles.pickerWrap}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <HexColorPicker color={color} onChange={setColor} />
            </div>
          ) : null}
        </div>
      </ComicPageRow>

      <div className={styles.shapeRows}>
        {[COMIC_LABEL_SHAPE_PRESETS.slice(0, 3), COMIC_LABEL_SHAPE_PRESETS.slice(3)].map(
          (row, rowIndex) => (
            <ComicPageRow key={rowIndex} className={styles.shapeRow}>
              {row.map((preset) => {
                const selected = shapeId === preset.id;
                return (
                  <ComicPagePanel
                    key={preset.id}
                    selectable
                    selected={selected}
                    onSelect={() => setShapeId(preset.id)}
                    background={selected ? "solid" : "halftone"}
                    color="white"
                    overflowVisible
                    flexWeight={1}
                    className={styles.shapePanel}
                    ariaLabel={`${preset.label} shape`}
                    style={
                      selected
                        ? ({ "--comic-panel-base": color } as CSSProperties)
                        : undefined
                    }
                  >
                    <div className={styles.shapePreview}>
                      <ComicBurstLabel
                        text={COMIC_LABEL_SHAPE_PREVIEW_TEXT}
                        fill="#ffffff"
                        stroke={selected ? "#111111" : "#555555"}
                        shapeKind={preset.kind}
                        spikeCount={preset.spikeCount}
                        randomness={preset.randomness}
                        seed={preset.id}
                        fontSize={14}
                        paddingX={22}
                        paddingY={14}
                      />
                    </div>
                  </ComicPagePanel>
                );
              })}
            </ComicPageRow>
          ),
        )}
      </div>

      <div className={styles.footerRow}>
        <Tooltip title={disabledReason ?? ""}>
          <span className={styles.tooltipWrap}>
            <button
              type="button"
              className={styles.saveButton}
              disabled={!canSave}
              aria-busy={busy || undefined}
              aria-label={label ? "Save label" : "Create label"}
              onClick={() => {
                if (!canSave) return;
                submit();
              }}
            >
              <ComicBurstLabel
                className={styles.saveBurst}
                text={saveText}
                fill={canSave ? color : SAVE_DISABLED_FILL}
                shapeKind="rect"
                seed="save-rect"
                fontSize={22}
                paddingX={48}
                paddingY={10}
                strokeWidth={3}
              />
            </button>
          </span>
        </Tooltip>
      </div>
    </div>
  );

  if (embedded) {
    if (!open) return null;
    return body;
  }

  return (
    <ComicPageDialog
      open={open}
      showClose
      contentClassName={styles.dialogContent}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      {body}
    </ComicPageDialog>
  );
}
