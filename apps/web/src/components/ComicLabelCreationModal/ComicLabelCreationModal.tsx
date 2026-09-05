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
  type ComicLabelShapeId,
} from "./comicLabelShapes";
import styles from "./ComicLabelCreationModal.module.css";

const BRUSH_SRC = "/brush-paint-repair.svg";

export type ComicLabelCreationModalProps = {
  open: boolean;
  accountId: string;
  label?: LabelDto;
  onClose: () => void;
  onCreated?: (label: LabelDto) => void;
  onUpdated?: (label: LabelDto) => void;
};

function shapePreset(id: ComicLabelShapeId) {
  return COMIC_LABEL_SHAPE_PRESETS.find((p) => p.id === id) ?? COMIC_LABEL_SHAPE_PRESETS[0]!;
}

export function ComicLabelCreationModal({
  open,
  accountId,
  label,
  onClose,
  onCreated,
  onUpdated,
}: ComicLabelCreationModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(getRandomLabelColor);
  const [shapeId, setShapeId] = useState<ComicLabelShapeId>("classic");
  const [pickerOpen, setPickerOpen] = useState(false);
  const colorShellRef = useRef<HTMLDivElement | null>(null);

  const { labels, isLoading, createLabel, updateLabel, isCreating, isUpdating } = useAccountLabels({
    accountId,
    autofetch: open,
  });

  const trimmedName = name.trim();
  const shape = shapePreset(shapeId);
  const previewText =
    trimmedName.length > 0 ? formatComicLabelText(trimmedName) : formatComicLabelText("abc");

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

  useEffect(() => {
    if (!open) {
      setPickerOpen(false);
      return;
    }
    setName(label?.name ?? "");
    setColor(label?.color ?? getRandomLabelColor());
    setShapeId("classic");
    setPickerOpen(false);
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
      onSuccess: async (created) => {
        comicToast.success("Label created");
        onCreated?.(created);
        setName("");
        setColor(getRandomLabelColor());
        setShapeId("classic");
        onClose();
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

  return (
    <ComicPageDialog
      open={open}
      showClose
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <div className={styles.body}>
        <ComicPageRow columns="2fr-1fr" className={styles.topRow}>
          <ComicPagePanel
            background="solid"
            color="white"
            overflowVisible
            contentAlign="center"
            className={styles.previewPanel}
            title="Preview"
            footer={
              trimmedName.length > 0 && trimmedName.length < COMIC_LABEL_NAME_MIN
                ? `Min ${COMIC_LABEL_NAME_MIN} chars`
                : undefined
            }
          >
            <div className={styles.previewStage}>
              <div className={styles.burstWrap}>
                <ComicBurstLabel
                  text={previewText}
                  fill={color}
                  spikeCount={shape.spikeCount}
                  randomness={shape.randomness}
                  seed={shape.id}
                />
                <input
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
              {trimmedName.length === 0 ? (
                <p className={styles.previewHint}>Type a name (3–15)</p>
              ) : null}
            </div>
          </ComicPagePanel>

          <div ref={colorShellRef} className={styles.colorShell} style={colorPanelStyle}>
            <ComicPagePanel
              title="Color"
              background="solid"
              color="white"
              contentAlign="center"
              className={styles.colorPanel}
              ariaLabel="Label color"
            >
              {pickerOpen ? (
                <div
                  className={styles.pickerWrap}
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <HexColorPicker color={color} onChange={setColor} />
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.colorBody}
                  onClick={openPicker}
                  aria-label="Open color picker"
                >
                  <span className={styles.colorSwatch} style={{ backgroundColor: color }} />
                  {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG asset */}
                  <img className={styles.brush} src={BRUSH_SRC} alt="" draggable={false} />
                </button>
              )}
            </ComicPagePanel>
          </div>
        </ComicPageRow>

        <ComicPageRow className={styles.shapeRow}>
          {COMIC_LABEL_SHAPE_PRESETS.map((preset) => {
            const selected = shapeId === preset.id;
            return (
              <ComicPagePanel
                key={preset.id}
                selectable
                selected={selected}
                onSelect={() => setShapeId(preset.id)}
                background="halftone"
                color={selected ? "orange" : "white"}
                overflowVisible
                flexWeight={1}
                className={styles.shapePanel}
                ariaLabel={`${preset.label} shape`}
              >
                <div className={styles.shapePreview}>
                  <ComicBurstLabel
                    text={formatComicLabelText(preset.label.slice(0, 6))}
                    fill={selected ? color : "#888888"}
                    spikeCount={preset.spikeCount}
                    randomness={preset.randomness}
                    seed={preset.id}
                    fontSize={18}
                  />
                  <p className={styles.shapeCaption}>{preset.label}</p>
                </div>
              </ComicPagePanel>
            );
          })}
        </ComicPageRow>

        <ComicPageRow className={styles.footerRow}>
          <Tooltip title={disabledReason ?? ""}>
            <span className={styles.tooltipWrap}>
              <ComicPagePanel
                span="full"
                selectable
                selected={canSave}
                onSelect={() => {
                  if (!canSave) return;
                  submit();
                }}
                background={canSave ? "halftone" : "solid"}
                color={canSave ? "teal" : "white"}
                loading={isCreating || isUpdating}
                ariaLabel={label ? "Save label" : "Create label"}
                className={styles.savePanel}
              >
                <p className={styles.saveLabel}>{label ? "Save" : "Create"}</p>
              </ComicPagePanel>
            </span>
          </Tooltip>
        </ComicPageRow>
      </div>
    </ComicPageDialog>
  );
}
