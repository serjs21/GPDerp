"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { LabelDto } from "@/api/labels";
import { useHaikuFilters } from "@/app/providers/HaikuFiltersProvider";
import { ComicLabelCreationModal } from "@/components/ComicLabelCreationModal";
import { ComicPageRow } from "@/components/ComicPageLayout";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { withDefaults } from "@/utils/props/withDefaults";
import { LabelActions } from "./LabelActions";
import { ManageLabelConnections } from "./ManageLabelConnections";
import { ManageLabelPreview } from "./ManageLabelPreview";
import { useLabelDelete } from "./useLabelDelete";
import { useLabelRowEnter } from "./useLabelRowEnter";
import { useLabelRowExit } from "./useLabelRowExit";
import {
  connectedHaikusSummary,
  rowMotionClassName,
  rowMotionStyle,
  rowRootClassName,
} from "./utils/manageLabelRowUtils";
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

const MANAGE_LABEL_DEFAULTS = { forceExiting: false, animateEnter: false, enterDelayMs: 0 };

export function ManageLabel(props: ManageLabelProps) {
  const { forceExiting, animateEnter, enterDelayMs } = withDefaults(props, MANAGE_LABEL_DEFAULTS);
  const { accountId, label } = props;
  const t = useTranslations("ManageLabel.manageLabel");
  const router = useRouter();
  const { setSelectedLabelIds } = useHaikuFilters();
  const [editOpen, setEditOpen] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const { entering, handleAnimationEnd } = useLabelRowEnter({
    rootRef,
    animateEnter,
    enterDelayMs,
    labelId: label.id,
    onEnterAnimationEnd: props.onEnterAnimationEnd,
  });
  const { exiting, collapsing, startExit } = useLabelRowExit({
    rootRef,
    forceExiting,
    stripClassName: styles.strip,
    onExitComplete: props.onExitComplete,
  });
  const { deleteOpen, setDeleteOpen, deleting, confirmDelete } = useLabelDelete(accountId, label.id, () => {
    props.onExitStart?.();
    startExit();
  });
  const connected = connectedHaikusSummary(label);

  const handleTuneIn = () => {
    setSelectedLabelIds([label.id]);
    router.push("/");
  };

  return (
    <>
      <article ref={rootRef} className={rowRootClassName(exiting, collapsing)}>
        <div
          className={rowMotionClassName(exiting, entering)}
          style={rowMotionStyle({ entering, exiting, enterDelayMs })}
          onAnimationEnd={handleAnimationEnd}
        >
          <ComicPageRow className={styles.strip}>
            <ManageLabelPreview label={label} onEdit={() => setEditOpen(true)} />
            <ManageLabelConnections
              accountId={accountId}
              labelName={label.name}
              items={connected.items}
              total={connected.total}
              hasConnections={connected.hasConnections}
              onTuneIn={handleTuneIn}
            />
            <LabelActions
              className={styles.actionSlot}
              labelName={label.name}
              hasConnections={connected.hasConnections}
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
          props.onChanged?.();
        }}
      />

      <DeleteConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={confirmDelete}
        confirming={deleting || exiting}
        question={t("deleteQuestion")}
        cancelLabel={t("cancel")}
        confirmLabel={t("confirmDelete")}
      />
    </>
  );
}
