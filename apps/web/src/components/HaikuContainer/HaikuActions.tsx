"use client";

import axios from "axios";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { HaikuDto } from "@/api/haikus";
import { deleteHaiku } from "@/api/haikus";
import { comicToast } from "@/components/ComicToast";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { SakuraPetalLoader } from "@/components/Loaders";
import { CreateAddLabelsModal } from "@/components/CreateAddLabelsModal";
import { ShareModal } from "@/components/ShareModal/ShareModal";
import { Tooltip } from "@/components/StyledComponents";
import { useLanternActionsDock } from "@/components/Lantern/LanternActionsDockContext";
import { useCopy } from "@/hooks/useCopy";
import { formatHaikuPlainToText, formatHaikuTitle } from "@/utils/strings";
import styles from "./HaikuActions.module.css";

export type HaikuActionsProps =
  | { variant: "generating" }
  | {
      variant: "saved";
      haiku: HaikuDto;
      onDeleted?: () => void;
      onChanged?: () => void;
      /** When set, confirm delegates delete to this handler (animation + API orchestration). */
      onDelete?: () => Promise<void>;
      /** Force hover state (Storybook / tests). */
      forcedHover?: HoverTarget;
      /** Force open state (Storybook / tests). */
      forcedOpen?: boolean;
    };

type HoverTarget = "delete" | "share" | "label" | "copy" | null;

const ACTIONS = [
  {
    id: "delete" as const,
    label: "Delete",
    ariaLabel: "Delete haiku",
    iconSrc: "/lantern_actions/delete.svg",
    slotClass: styles.slotDelete,
    enterFrom: "left" as const,
  },
  {
    id: "share" as const,
    label: "Share",
    ariaLabel: "Share haiku",
    iconSrc: "/lantern_actions/share.svg",
    slotClass: styles.slotShare,
    enterFrom: "left" as const,
  },
  {
    id: "label" as const,
    label: "Label",
    ariaLabel: "Add label",
    iconSrc: "/lantern_actions/label.svg",
    slotClass: styles.slotLabel,
    enterFrom: "right" as const,
  },
  {
    id: "copy" as const,
    label: "Copy",
    ariaLabel: "Copy to clipboard",
    iconSrc: "/lantern_actions/copy.svg",
    slotClass: styles.slotCopy,
    enterFrom: "right" as const,
  },
];

function SlotFace({
  hidden,
  enterFrom,
  children,
}: {
  hidden?: boolean;
  enterFrom?: "left" | "right";
  children: ReactNode;
}) {
  const className = [
    styles.slotFace,
    enterFrom === "left" ? styles.slotFaceFromLeft : "",
    enterFrom === "right" ? styles.slotFaceFromRight : "",
    hidden ? styles.slotFaceHidden : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={className} aria-hidden={hidden || undefined}>
      {children}
    </span>
  );
}

function panelHoverClass(hover: HoverTarget): string {
  switch (hover) {
    case "delete":
      return styles.panelHoverDelete;
    case "share":
      return styles.panelHoverShare;
    case "label":
      return styles.panelHoverLabel;
    case "copy":
      return styles.panelHoverCopy;
    default:
      return "";
  }
}

export const HaikuActions = (props: HaikuActionsProps) => {
  const [shareOpen, setShareOpen] = useState(false);
  const [labelsOpen, setLabelsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hover, setHover] = useState<HoverTarget>(null);
  const [open, setOpen] = useState(false);
  const [clapBurst, setClapBurst] = useState<"idle" | "hold" | "fade">("hold");
  const wasOpenRef = useRef(false);
  const clapTimersRef = useRef<number[]>([]);
  const { copy } = useCopy();
  const dock = useLanternActionsDock();

  const forcedHover = props.variant === "saved" ? props.forcedHover : undefined;
  const forcedOpen = props.variant === "saved" ? props.forcedOpen : undefined;
  const activeHover = forcedHover !== undefined ? forcedHover : hover;
  const isOpen = forcedOpen !== undefined ? forcedOpen : open;

  const haiku = props.variant === "saved" ? props.haiku : null;
  const onDeleted = props.variant === "saved" ? props.onDeleted : undefined;
  const onDelete = props.variant === "saved" ? props.onDelete : undefined;

  const clearClapTimers = useCallback(() => {
    for (const id of clapTimersRef.current) window.clearTimeout(id);
    clapTimersRef.current = [];
  }, []);

  const playClapBurst = useCallback(() => {
    clearClapTimers();
    setClapBurst("hold");
    // const fadeId = window.setTimeout(() => setClapBurst("fade"), 1000);
    // const doneId = window.setTimeout(() => setClapBurst("idle"), 1200);
    // clapTimersRef.current = [fadeId, doneId];
  }, [clearClapTimers]);

  useEffect(() => {
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = isOpen;
    if (isOpen && !wasOpen) playClapBurst();
    if (!isOpen) {
      clearClapTimers();
      setClapBurst("idle");
    }
  }, [clearClapTimers, isOpen, playClapBurst]);

  useEffect(() => () => clearClapTimers(), [clearClapTimers]);

  const setHoverIfLive = (next: HoverTarget) => {
    if (forcedHover === undefined) setHover(next);
  };

  const clearHover = () => setHoverIfLive(null);

  const setOpenIfLive = (next: boolean) => {
    if (forcedOpen === undefined) setOpen(next);
  };

  useEffect(() => {
    if (shareOpen || labelsOpen || deleteOpen) {
      setHoverIfLive(null);
      setOpenIfLive(false);
    }
    // Intentionally only depend on modal visibility.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareOpen, labelsOpen, deleteOpen]);

  const setHoverFromFocus = (next: HoverTarget, target: HTMLElement) => {
    if (target.matches(":focus-visible")) setHoverIfLive(next);
  };

  const clearHoverFromBlur = (event: FocusEvent<HTMLButtonElement>) => {
    const root = event.currentTarget.closest("[data-haiku-actions-panel]");
    const related = event.relatedTarget;
    if (related instanceof Node && root?.contains(related)) return;
    clearHover();
  };

  const handleDeleteConfirm = useCallback(async () => {
    if (!haiku) return;
    setDeleting(true);
    try {
      if (onDelete) {
        await onDelete();
        setDeleteOpen(false);
        return;
      }
      await deleteHaiku(haiku.id);
      comicToast.success("Haiku deleted");
      onDeleted?.();
      setDeleteOpen(false);
    } catch (e) {
      if (onDelete) {
        // LanternDeleteExit already toasted / reported failure; keep modal open.
        return;
      }
      if (axios.isAxiosError(e) && e.response?.status === 403) {
        comicToast.error("You are not allowed to delete this haiku.");
      } else {
        comicToast.error("Could not delete haiku.");
      }
    } finally {
      setDeleting(false);
    }
  }, [haiku, onDelete, onDeleted]);

  if (props.variant === "generating") {
    return (
      <Tooltip title="Saving this haiku…">
        <span className={styles.loaderWrap}>
          <SakuraPetalLoader compact />
        </span>
      </Tooltip>
    );
  }

  const { haiku: savedHaiku, onChanged } = props;

  const onActionClick = (id: NonNullable<HoverTarget>) => {
    clearHover();
    switch (id) {
      case "delete":
        setDeleteOpen(true);
        break;
      case "share":
        setShareOpen(true);
        break;
      case "label":
        setLabelsOpen(true);
        break;
      case "copy":
        void copy(formatHaikuPlainToText(savedHaiku));
        break;
    }
  };

  const panel = (
    <div
      className={styles.anchor}
      data-haiku-actions-panel=""
      onMouseLeave={clearHover}
    >
      <div className={styles.shell}>
        <div
          className={[styles.panel, panelHoverClass(activeHover)].filter(Boolean).join(" ")}
          role="group"
          aria-label="Haiku actions"
        >
          {ACTIONS.map((action) => (
            <div key={action.id} className={`${styles.slot} ${action.slotClass}`}>
              <button
                type="button"
                className={styles.panelButton}
                aria-label={action.ariaLabel}
                onMouseEnter={() => setHoverIfLive(action.id)}
                onFocus={(event) =>
                  setHoverFromFocus(action.id, event.currentTarget)
                }
                onBlur={clearHoverFromBlur}
                onClick={() => onActionClick(action.id)}
              >
                <SlotFace>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={action.iconSrc}
                    alt=""
                    className={styles.iconImg}
                    width={18}
                    height={18}
                  />
                </SlotFace>
                <SlotFace
                  enterFrom={action.enterFrom}
                  hidden={activeHover !== action.id}
                >
                  <span className={styles.actionName}>{action.label}</span>
                </SlotFace>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const panelNode = isOpen ? (
    dock ? (
      createPortal(panel, dock)
    ) : (
      <div className={styles.inlinePanel}>{panel}</div>
    )
  ) : null;

  return (
    <>
      <span className={styles.toggleWrap}>
        <button
          type="button"
          className={styles.toggle}
          aria-label={isOpen ? "Hide haiku actions" : "Show haiku actions"}
          aria-expanded={isOpen}
          onClick={() => setOpenIfLive(!isOpen)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              isOpen
                ? "/lantern_actions/actions_open.svg"
                : "/lantern_actions/actions_closed.svg"
            }
            alt=""
            className={styles.toggleIcon}
            width={28}
            height={28}
          />
        </button>
        {clapBurst !== "idle" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/lantern_actions/clap_sound.svg"
            alt=""
            className={[
              styles.clapBurst,
              clapBurst === "fade" ? styles.clapBurstFade : "",
            ]
              .filter(Boolean)
              .join(" ")}
            width={28}
            height={28}
            aria-hidden
          />
        ) : null}
      </span>
      {panelNode}
      <ShareModal
        haikuId={savedHaiku.id}
        haikuSubject={formatHaikuTitle(savedHaiku)}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
      <CreateAddLabelsModal
        open={labelsOpen}
        haiku={savedHaiku}
        initialTab="add"
        onClose={() => setLabelsOpen(false)}
        onSaved={onChanged}
      />
      <DeleteConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        confirming={deleting}
      />
    </>
  );
};
