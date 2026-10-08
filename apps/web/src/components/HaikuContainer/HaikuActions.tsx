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
import { useTranslations } from "next-intl";
import type { HaikuDto } from "@/api/haikus";
import { deleteHaiku } from "@/api/haikus";
import { comicToast } from "@/components/ComicToast";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { SakuraPetalLoader } from "@/components/Loaders";
import { CreateAddLabelsModal } from "@/components/CreateAddLabelsModal";
import { ShareModal } from "@/components/ShareModal/ShareModal";
import { Tooltip } from "@/components/StyledComponents";
import { useLanternActionsDock } from "@/components/Lantern/LanternActionsDockContext";
import { PathNavigationArrows, usePathNavigation } from "@/components/PathNavigation";
import { useCopy } from "@/hooks/useCopy";
import { useHaikuActionsOpenPreference } from "@/hooks/useHaikuActionsOpenPreference";
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

const CLAP_HOLD_MS = 1000;
const CLAP_FADE_MS = 200;

const ACTIONS = [
  {
    id: "delete" as const,
    label: "deleteLabel",
    ariaLabel: "deleteAriaLabel",
    iconSrc: "/lantern_actions/delete.svg",
    slotClass: styles.slotDelete,
    enterFrom: "left" as const,
  },
  {
    id: "share" as const,
    label: "shareLabel",
    ariaLabel: "shareAriaLabel",
    iconSrc: "/lantern_actions/share.svg",
    slotClass: styles.slotShare,
    enterFrom: "left" as const,
  },
  {
    id: "label" as const,
    label: "labelLabel",
    ariaLabel: "labelAriaLabel",
    iconSrc: "/lantern_actions/label.svg",
    slotClass: styles.slotLabel,
    enterFrom: "right" as const,
  },
  {
    id: "copy" as const,
    label: "copyLabel",
    ariaLabel: "copyAriaLabel",
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
  const t = useTranslations("HaikuContainer.haikuActions");
  const [shareOpen, setShareOpen] = useState(false);
  const [labelsOpen, setLabelsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hover, setHover] = useState<HoverTarget>(null);
  const [showClap, setShowClap] = useState(false);
  const [clapFading, setClapFading] = useState(false);
  const [clapFixedPos, setClapFixedPos] = useState<{ top: number; left: number } | null>(
    null,
  );
  const clapTimersRef = useRef<number[]>([]);
  const toggleWrapRef = useRef<HTMLSpanElement | null>(null);
  const { copy } = useCopy();
  const dock = useLanternActionsDock();
  const pathNavigation = usePathNavigation();

  const forcedHover = props.variant === "saved" ? props.forcedHover : undefined;
  const forcedOpen = props.variant === "saved" ? props.forcedOpen : undefined;
  const { isOpen, setOpenPreference } = useHaikuActionsOpenPreference(forcedOpen);
  const activeHover = forcedHover !== undefined ? forcedHover : hover;
  const modalBlocking = shareOpen || labelsOpen || deleteOpen;
  const showPanel = isOpen && !modalBlocking;

  const haiku = props.variant === "saved" ? props.haiku : null;
  const onDeleted = props.variant === "saved" ? props.onDeleted : undefined;
  const onDelete = props.variant === "saved" ? props.onDelete : undefined;

  useEffect(
    () => () => {
      for (const id of clapTimersRef.current) window.clearTimeout(id);
    },
    [],
  );

  const setHoverIfLive = (next: HoverTarget) => {
    if (forcedHover === undefined) setHover(next);
  };

  const clearHover = () => setHoverIfLive(null);

  useEffect(() => {
    if (modalBlocking) setHoverIfLive(null);
    // Clear hover only; open preference stays until the user toggles off.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalBlocking]);

  const handleToggle = () => {
    const next = !isOpen;
    if (next) {
      const wrap = toggleWrapRef.current;
      if (wrap) {
        const wrapRect = wrap.getBoundingClientRect();
        setClapFixedPos({
          top: wrapRect.top - 16,
          left: wrapRect.right - 16,
        });
      }
      for (const id of clapTimersRef.current) window.clearTimeout(id);
      clapTimersRef.current = [];
      setClapFading(false);
      setShowClap(true);
      const fadeId = window.setTimeout(() => {
        setClapFading(true);
        const doneId = window.setTimeout(() => {
          setShowClap(false);
          setClapFading(false);
          setClapFixedPos(null);
          clapTimersRef.current = [];
        }, CLAP_FADE_MS);
        clapTimersRef.current.push(doneId);
      }, CLAP_HOLD_MS);
      clapTimersRef.current = [fadeId];
    }
    setOpenPreference(next);
  };

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
      comicToast.success(t("deleted"));
      onDeleted?.();
      setDeleteOpen(false);
    } catch (e) {
      if (onDelete) {
        // LanternDeleteExit already toasted / reported failure; keep modal open.
        return;
      }
      if (axios.isAxiosError(e) && e.response?.status === 403) {
        comicToast.error(t("deleteForbidden"));
      } else {
        comicToast.error(t("deleteFailed"));
      }
    } finally {
      setDeleting(false);
    }
  }, [haiku, onDelete, onDeleted, t]);

  if (props.variant === "generating") {
    return (
      <Tooltip title={t("saving")}>
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

  const shell = (
    <div className={styles.shell}>
      <div
        className={[styles.panel, panelHoverClass(activeHover)].filter(Boolean).join(" ")}
        role="group"
        aria-label={t("groupAriaLabel")}
      >
        {ACTIONS.map((action) => (
          <div key={action.id} className={`${styles.slot} ${action.slotClass}`}>
            <button
              type="button"
              className={styles.panelButton}
              aria-label={t(action.ariaLabel)}
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
                <span className={styles.actionName}>{t(action.label)}</span>
              </SlotFace>
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const panel = (
    <div
      className={styles.anchor}
      data-haiku-actions-panel=""
      onMouseLeave={clearHover}
    >
      {pathNavigation ? (
        <PathNavigationArrows {...pathNavigation}>{shell}</PathNavigationArrows>
      ) : (
        shell
      )}
    </div>
  );

  const panelNode = showPanel ? (
    dock ? (
      createPortal(panel, dock)
    ) : (
      <div className={styles.inlinePanel}>{panel}</div>
    )
  ) : null;

  const clapBurstNode =
    showClap && clapFixedPos ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/lantern_actions/clap_sound.svg"
        alt=""
        className={[styles.clapBurst, clapFading ? styles.clapBurstFade : ""]
          .filter(Boolean)
          .join(" ")}
        style={{ top: clapFixedPos.top, left: clapFixedPos.left }}
        width={28}
        height={28}
        aria-hidden
      />
    ) : null;

  return (
    <>
      <span ref={toggleWrapRef} className={styles.toggleWrap}>
        <button
          type="button"
          className={styles.toggle}
          aria-label={isOpen ? t("hideActions") : t("showActions")}
          aria-expanded={isOpen}
          onClick={handleToggle}
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
      </span>
      {typeof document !== "undefined" && clapBurstNode
        ? createPortal(clapBurstNode, document.body)
        : null}
      {panelNode}
      <ShareModal
        haikuId={savedHaiku.id}
        haikuSubject={formatHaikuTitle(savedHaiku)}
        haiku={savedHaiku}
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
