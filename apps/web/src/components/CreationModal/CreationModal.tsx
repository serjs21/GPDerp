"use client";

import type { HaikuDto } from "@/api/haikus";
import { Button, Modal } from "@/components/StyledComponents";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import styles from "./CreationModal.module.css";

export type CreationModalProps = {
  open: boolean;
  onKeepScrolling: () => void;
  onGoToHaiku: () => void;
  generatingDraft?: GeneratingDraft | null;
  /** Optional saved haiku once complete (stories can pass a mock). */
  haiku?: HaikuDto | null;
};

export function CreationModal({
  open,
  onKeepScrolling,
  onGoToHaiku,
  generatingDraft = null,
  haiku = null,
}: CreationModalProps) {
  const ariaLabel = generatingDraft
    ? `Generating haiku: ${generatingDraft.subject}`
    : haiku
      ? `Haiku lantern: ${haiku.title ?? ""}`
      : "Haiku creation";

  return (
    <Modal
      open={open}
      title="Creating haiku"
      onCancel={onKeepScrolling}
      destroyOnHidden
      centered
      className={styles.modal}
      rootClassName={styles.modalRoot}
      styles={{
        content: { overflow: "visible", background: "transparent", boxShadow: "none" },
        body: { overflow: "visible" },
        header: { background: "transparent", borderBottom: "none" },
        footer: { background: "transparent", borderTop: "none" },
      }}
      footer={
        <div className={styles.footer}>
          <Button onClick={onKeepScrolling}>Keep scrolling</Button>
          <Button type="primary" onClick={onGoToHaiku}>
            Go to haiku
          </Button>
        </div>
      }
    >
      <div className={styles.stage}>
        <div className={styles.flyIn} key={generatingDraft?.requestId ?? haiku?.id ?? "lantern"}>
          <LanternFrame
            ariaLabel={ariaLabel}
            widthRem={14}
            generating={Boolean(generatingDraft)}
          >
            {generatingDraft ? (
              <Lantern generatingDraft={generatingDraft} showActions={false} />
            ) : haiku ? (
              <Lantern haiku={haiku} showActions={false} />
            ) : null}
          </LanternFrame>
        </div>
      </div>
    </Modal>
  );
}
