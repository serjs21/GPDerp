"use client";

import {
  useCallback,
  useState,
  type CSSProperties,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  fetchLabelConnectedHaikus,
  labelQueryKeys,
  type LabelConnectedHaikuPreview,
  type LabelDto,
} from "@/api/labels";
import { useHaikuFilters } from "@/app/providers/HaikuFiltersProvider";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { ComicLabelCreationModal } from "@/components/ComicLabelCreationModal";
import { resolveComicLabelShapePreset } from "@/components/ComicLabelCreationModal/comicLabelShapes";
import { ComicPagePanel, ComicPageRow } from "@/components/ComicPageLayout";
import { comicToast } from "@/components/ComicToast";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import { OverlayTitle } from "@/components/OverlayTitle";
import { SVGPanelActionButton } from "@/components/SVGPanelActionButton";
import { useAccountLabels } from "@/hooks/useAccountLabels";
import { HAIKU_MAX_LINE_CHARS, parseHaikuBody } from "@/utils/parseHaikuBody";
import styles from "./ManageLabel.module.css";

export type ManageLabelProps = {
  accountId: string;
  label: LabelDto;
  onChanged?: () => void;
};

const CONNECTED_PREVIEW_LIMIT = 3;
const LANTERN_WIDTH_REM = 4.6;
const FAN_STEP_REM = 2.85;
const DELETE_HOVER = "var(--accent-red, #aa1f3f)";
/** Cursive em-width so a max-length line stays on one row in the preview. */
const PREVIEW_CHAR_EM = 0.58;

function previewLanternBodyStyle(body: string) {
  const longest = Math.max(
    ...parseHaikuBody(body).lines.map((line) => line.length),
    1,
  );
  const fitChars = Math.min(HAIKU_MAX_LINE_CHARS, Math.max(longest, 8));
  return {
    "--lantern-body-font-size": `clamp(0.28rem, calc(100cqi / ${fitChars * PREVIEW_CHAR_EM}), 0.72rem)`,
  } as CSSProperties;
}

function fanOffsetRem(index: number, hovered: number | null, count: number): number {
  if (hovered == null || index === hovered || count < 2) return 0;
  const others = Array.from({ length: count }, (_, i) => i).filter((i) => i !== hovered);
  const pos = others.indexOf(index);
  if (pos < 0) return 0;
  const side = pos % 2 === 0 ? -1 : 1;
  const depth = Math.floor(pos / 2) + 1;
  return side * depth * FAN_STEP_REM;
}

function ConnectedLanternStack({
  accountId,
  items,
}: {
  accountId: string;
  items: LabelConnectedHaikuPreview[];
}) {
  const [stackActive, setStackActive] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  const fanActive = stackActive && items.length > 1;

  return (
    <div
      className={styles.lanternStack}
      data-count={items.length}
      data-active={fanActive ? "true" : undefined}
      onMouseEnter={() => setStackActive(true)}
      onMouseLeave={() => {
        setStackActive(false);
        setHovered(null);
      }}
    >
      {items.map((haiku, index) => {
        let offsetRem = 0;
        if (fanActive) {
          if (hovered != null) {
            offsetRem = fanOffsetRem(index, hovered, items.length);
          } else {
            // Peek all lanterns so lower ones become hoverable.
            const peekSlots =
              items.length === 2 ? [-FAN_STEP_REM * 0.7, FAN_STEP_REM * 0.7] : [-FAN_STEP_REM, 0, FAN_STEP_REM];
            offsetRem = peekSlots[index] ?? 0;
          }
        }
        const isHovered = hovered === index;
        return (
          <div
            key={haiku.id}
            className={styles.lanternStackItem}
            style={{
              zIndex: isHovered ? 20 : items.length - index,
              transform: `translate(-50%, -50%) translateX(${offsetRem}rem)`,
            }}
            onMouseEnter={() => setHovered(index)}
          >
            <LanternFrame
              ariaLabel={`Haiku lantern: ${haiku.title}`}
              className={styles.lanternFrame}
              widthRem={LANTERN_WIDTH_REM}
            >
              <Lantern
                haiku={{
                  id: haiku.id,
                  title: haiku.title,
                  titleSuffix: 0,
                  body: haiku.body,
                  createdAt: "",
                  accountId,
                  createdById: "",
                  labels: [],
                }}
                showActions={false}
                bodyOnly
                className={styles.previewLantern}
                style={previewLanternBodyStyle(haiku.body)}
              />
            </LanternFrame>
          </div>
        );
      })}
    </div>
  );
}

function ConnectedHaikusPanel({
  accountId,
  labelName,
  items,
  total,
  isPending,
}: {
  accountId: string;
  labelName: string;
  items: LabelConnectedHaikuPreview[];
  total: number;
  isPending: boolean;
}) {
  const moreCount = Math.max(0, total - CONNECTED_PREVIEW_LIMIT);

  return (
    <ComicPagePanel
      background="halftone"
      color="sky"
      overflowVisible
      flexWeight={1}
      contentAlign="center"
      className={styles.connectedPanel}
      ariaLabel={`Haikus labeled ${labelName}`}
    >
      <div className={styles.connectedBody}>
        {isPending ? (
          <p className={styles.connectedQuiet}>Loading…</p>
        ) : items.length === 0 ? (
          <p className={styles.connectedQuiet}>No lanterns yet</p>
        ) : (
          <>
            <ConnectedLanternStack accountId={accountId} items={items} />
            {moreCount > 0 ? (
              <p className={styles.connectedMore}>{`+${moreCount} more`}</p>
            ) : null}
          </>
        )}
      </div>
    </ComicPagePanel>
  );
}

export function ManageLabel({ accountId, label, onChanged }: ManageLabelProps) {
  const router = useRouter();
  const { setSelectedLabelIds } = useHaikuFilters();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { deleteLabel } = useAccountLabels({ accountId, autofetch: false });
  const shape = resolveComicLabelShapePreset(label.shape);

  const connectedQuery = useQuery({
    queryKey: labelQueryKeys.connectedHaikus(label.id, CONNECTED_PREVIEW_LIMIT),
    queryFn: () =>
      fetchLabelConnectedHaikus(label.id, { limit: CONNECTED_PREVIEW_LIMIT }),
  });

  const connectedTotal = connectedQuery.data?.total ?? 0;
  const connectedItems = connectedQuery.data?.items ?? [];
  const hasConnections = connectedTotal > 0;

  const handleDeleteConfirm = useCallback(async () => {
    setDeleting(true);
    try {
      await deleteLabel({
        labelId: label.id,
        onSuccess: async () => {
          comicToast.success("Label deleted");
          onChanged?.();
          setDeleteOpen(false);
        },
        onError: async () => {
          comicToast.error("Could not delete label");
        },
      });
    } finally {
      setDeleting(false);
    }
  }, [deleteLabel, label.id, onChanged]);

  const handleCheckThemOut = useCallback(() => {
    setSelectedLabelIds([label.id]);
    router.push("/");
  }, [label.id, router, setSelectedLabelIds]);

  const labelPreview = (
    <ComicPagePanel
      background="solid"
      color="white"
      overflowVisible
      flexWeight={1}
      className={styles.labelPanel}
      ariaLabel={label.name}
    >
      <div className={styles.labelPreview}>
        <ComicBurstLabel
          text={formatComicLabelText(label.name)}
          fill={label.color || "#888888"}
          shapeKind={shape.kind}
          spikeCount={shape.spikeCount}
          randomness={shape.randomness}
          seed={shape.id}
          fontSize={20}
        />
      </div>
    </ComicPagePanel>
  );

  const connectedPanel = (
    <ConnectedHaikusPanel
      accountId={accountId}
      labelName={label.name}
      items={connectedItems}
      total={connectedTotal}
      isPending={connectedQuery.isPending}
    />
  );

  return (
    <article className={styles.root}>
      <ComicPageRow className={styles.strip}>
        <OverlayTitle title="Edit" direction="bottom" className={styles.overlaySlot}>
          <button
            type="button"
            className={styles.panelButton}
            onClick={() => setEditOpen(true)}
            aria-label={`Edit ${label.name}`}
          >
            {labelPreview}
          </button>
        </OverlayTitle>

        {hasConnections ? (
          <OverlayTitle
            title="Check them out"
            direction="bottom"
            className={[styles.overlaySlot, styles.overlaySlotFan].join(" ")}
          >
            <button
              type="button"
              className={styles.panelButton}
              onClick={handleCheckThemOut}
              aria-label={`View haikus labeled ${label.name}`}
            >
              {connectedPanel}
            </button>
          </OverlayTitle>
        ) : (
          <div className={styles.overlaySlot}>{connectedPanel}</div>
        )}

        <SVGPanelActionButton
          src="/panel_actions/delete.svg"
          label="Delete"
          ariaLabel={`Delete ${label.name}`}
          hoverFill={DELETE_HOVER}
          invertIconOnHover
          onSelect={() => setDeleteOpen(true)}
          className={styles.actionSlot}
        />
      </ComicPageRow>

      <ComicLabelCreationModal
        open={editOpen}
        accountId={accountId}
        label={label}
        onClose={() => setEditOpen(false)}
        onUpdated={async () => {
          onChanged?.();
        }}
      />

      <DeleteConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        confirming={deleting}
        question="Delete this label?"
        cancelLabel="Not yet"
        confirmLabel="Delete"
      />
    </article>
  );
}
