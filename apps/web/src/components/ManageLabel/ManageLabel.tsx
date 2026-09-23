"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type AnimationEvent,
} from "react";
import { useRouter } from "next/navigation";
import type { LabelDto } from "@/api/labels";
import { useHaikuFilters } from "@/app/providers/HaikuFiltersProvider";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { ComicLabelCreationModal } from "@/components/ComicLabelCreationModal";
import { resolveComicLabelShapePreset } from "@/components/ComicLabelCreationModal/comicLabelShapes";
import { ComicPagePanel, ComicPageRow } from "@/components/ComicPageLayout";
import { comicToast } from "@/components/ComicToast";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { useAccountLabels } from "@/hooks/useAccountLabels";
import { ConnectedHaikusPanel } from "./ConnectedHaikusPanel";
import { LabelActions } from "./LabelActions";
import {
  MAGIC_EXIT_BOING_MS,
  MAGIC_EXIT_COLLAPSE_MS,
} from "./consts/magicAnimationConsts";
import styles from "./ManageLabel.module.css";

export type ManageLabelProps = {
  accountId: string;
  label: LabelDto;
  onChanged?: () => void;
  /** Called before delete so the parent can keep the row mounted through exit. */
  onExitStart?: () => void;
  /** Called when height reaches 0 (or collapse times out). */
  onExitComplete?: () => void;
  /** Parent-held exit: keep playing exit even if this instance remounts. */
  forceExiting?: boolean;
  /** Play boingInUp on mount (newly added row). */
  animateEnter?: boolean;
  /** Stagger delay for sequential boingInUp (ms). */
  enterDelayMs?: number;
  onEnterAnimationEnd?: () => void;
};

export function ManageLabel({
  accountId,
  label,
  onChanged,
  onExitStart,
  onExitComplete,
  forceExiting = false,
  animateEnter = false,
  enterDelayMs = 0,
  onEnterAnimationEnd,
}: ManageLabelProps) {
  const router = useRouter();
  const { setSelectedLabelIds } = useHaikuFilters();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exiting, setExiting] = useState(forceExiting);
  const [collapsing, setCollapsing] = useState(false);
  const [entering, setEntering] = useState(animateEnter);
  const exitNotifiedRef = useRef(false);
  const rootRef = useRef<HTMLElement>(null);
  const { deleteLabel } = useAccountLabels({ accountId, autofetch: false });
  const shape = resolveComicLabelShapePreset(label.shape);

  const connectedTotal = label.connectedHaikus?.total ?? 0;
  const connectedItems = label.connectedHaikus?.items ?? [];
  const hasConnections = connectedTotal > 0;

  useEffect(() => {
    if (forceExiting) setExiting(true);
  }, [forceExiting]);

  useEffect(() => {
    if (animateEnter) setEntering(true);
  }, [animateEnter, label.id]);

  useEffect(() => {
    if (!entering) return;
    const node = rootRef.current;
    if (!node) return;
    const delay = Math.max(0, enterDelayMs);
    const timer = window.setTimeout(() => {
      node.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [entering, enterDelayMs, label.id]);

  const notifyExitComplete = useCallback(() => {
    if (exitNotifiedRef.current) return;
    exitNotifiedRef.current = true;
    onExitComplete?.();
  }, [onExitComplete]);

  // Lock measured height (no transition), then ease-in to 0 with boingOut.
  useEffect(() => {
    if (!exiting) {
      setCollapsing(false);
      const node = rootRef.current;
      if (node) {
        node.style.height = "";
        node.style.minHeight = "";
        node.style.marginBottom = "";
        node.style.transition = "";
        node.style.overflow = "";
      }
      return;
    }

    const node = rootRef.current;
    if (!node) return;

    const fromHeight = node.getBoundingClientRect().height;
    // 1) Pin current size with transition disabled so the start frame is real.
    node.style.transition = "none";
    node.style.overflow = "hidden";
    node.style.minHeight = "0px";
    node.style.height = `${fromHeight}px`;
    node.style.marginBottom = "0px";
    void node.offsetHeight; // force reflow with locked height

    setCollapsing(true);

    // 2) Enable transition and animate to 0 (same start as boingOut).
    node.style.transition = [
      `height ${MAGIC_EXIT_COLLAPSE_MS}ms ease-in`,
      `margin-bottom ${MAGIC_EXIT_COLLAPSE_MS}ms ease-in`,
    ].join(", ");
    node.style.height = "0px";
    node.style.marginBottom = "calc(-1 * var(--manage-label-list-gap, 2.25rem))";

    const onTransitionEnd = (event: Event) => {
      const te = event as globalThis.TransitionEvent;
      if (te.target !== node) return;
      if (te.propertyName !== "height") return;
      notifyExitComplete();
    };
    node.addEventListener("transitionend", onTransitionEnd);

    const fallback = window.setTimeout(() => {
      notifyExitComplete();
    }, MAGIC_EXIT_COLLAPSE_MS + 80);

    return () => {
      node.removeEventListener("transitionend", onTransitionEnd);
      window.clearTimeout(fallback);
    };
  }, [exiting, notifyExitComplete]);

  const handleDeleteConfirm = useCallback(async () => {
    setDeleting(true);
    try {
      await deleteLabel({
        labelId: label.id,
        onSuccess: async () => {
          comicToast.success("Label deleted");
          setDeleteOpen(false);
          onExitStart?.();
          setExiting(true);
        },
        onError: async () => {
          comicToast.error("Could not delete label");
        },
      });
    } finally {
      setDeleting(false);
    }
  }, [deleteLabel, label.id, onExitStart]);

  const handleTuneIn = useCallback(() => {
    setSelectedLabelIds([label.id]);
    router.push("/");
  }, [label.id, router, setSelectedLabelIds]);

  const handleAnimationEnd = (event: AnimationEvent<HTMLElement>) => {
    const name = event.animationName;
    if (entering && (name.includes("boingInUp") || name.includes("manageLabelBoingIn"))) {
      setEntering(false);
      onEnterAnimationEnd?.();
    }
  };

  return (
    <>
      <article
        ref={rootRef}
        className={[
          styles.root,
          exiting ? styles.rootExiting : "",
          collapsing ? styles.rootCollapsing : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div
          className={[
            exiting ? styles.boingOutDown : "",
            entering ? styles.boingInUp : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={
            entering && enterDelayMs > 0
              ? { animationDelay: `${enterDelayMs}ms` }
              : exiting
                ? { animationDuration: `${MAGIC_EXIT_BOING_MS}ms` }
                : undefined
          }
          onAnimationEnd={handleAnimationEnd}
        >
          <ComicPageRow className={styles.strip}>
            <div className={styles.labelSlot}>
              <ComicPagePanel
                background="solid"
                color="white"
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
            </div>

            <div className={styles.connectedSlot}>
              <ConnectedHaikusPanel
                accountId={accountId}
                labelName={label.name}
                items={connectedItems}
                total={connectedTotal}
              />
            </div>

            <LabelActions
              className={styles.actionSlot}
              labelName={label.name}
              hasConnections={hasConnections}
              onTuneIn={handleTuneIn}
              onEdit={() => setEditOpen(true)}
              onDelete={() => setDeleteOpen(true)}
            />
          </ComicPageRow>
        </div>
      </article>

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
        confirming={deleting || exiting}
        question="Delete this label?"
        cancelLabel="Not yet"
        confirmLabel="Delete"
      />
    </>
  );
}
