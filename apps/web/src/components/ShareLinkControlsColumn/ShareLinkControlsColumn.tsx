"use client";

import { useTranslations } from "next-intl";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import { ShareLinkLifecycleAction } from "@/components/ShareLink/ShareLinkLifecycleAction";
import { ShareLinkSettingsControls } from "@/components/ShareLink/ShareLinkSettingsControls";
import { ShareLinkUpdateAction } from "@/components/ShareLinkActions";
import type { ShareLinkControlsColumnProps } from "./ShareLinkControlsColumn.types";
import styles from "./ShareLinkControlsColumn.module.css";

function cx(...names: (string | undefined)[]): string {
  return names.filter(Boolean).join(" ");
}

/** Limits panel + Update slot (with wake animation) + Launch/Stop/Restart, shared by the manage row and share modal. */
export function ShareLinkControlsColumn({ ctrl, classNames = {} }: ShareLinkControlsColumnProps) {
  const t = useTranslations("ShareLinkControlsColumn");
  return (
    <div className={cx(styles.column, classNames.column)}>
      <div className={cx(styles.row, classNames.row)}>
        <ComicPagePanel
          background="solid"
          color="white"
          contentAlign="start"
          className={cx(styles.panel, classNames.panel)}
          ariaLabel={t("settingsAriaLabel", { subject: ctrl.subject })}
        >
          <div className={cx(styles.body, classNames.body)}>
            <ShareLinkSettingsControls
              form={ctrl.form}
              setForm={ctrl.setForm}
              limitsLocked={ctrl.limitsLocked}
              formValid={ctrl.formValid}
              showUpdate={ctrl.showUpdate}
              updatingLimits={ctrl.updatingLimits}
              activating={ctrl.activating}
              deactivating={ctrl.deactivating}
              active={ctrl.active}
              busy={ctrl.busy}
              isUpdating={ctrl.isUpdating}
              busyDots={ctrl.busyDots}
              onUpdateLimits={ctrl.onUpdateLimits}
              onStart={ctrl.onStart}
              onStop={ctrl.onStop}
              restartReason={ctrl.restartReason}
              hideUpdate
              hideLifecycleAction
            />
          </div>
        </ComicPagePanel>
        <div className={cx(styles.update, classNames.update)}>
          <ShareLinkUpdateAction
            subject={ctrl.subject}
            active={ctrl.active}
            canUpdate={ctrl.showUpdate && ctrl.formValid}
            updating={ctrl.updatingLimits}
            onUpdate={() => void ctrl.onUpdateLimits()}
            wakeSegment={ctrl.wakeSegment}
            onWakeAnimationEnd={ctrl.onWakeAnimationEnd}
          />
        </div>
      </div>
      <ShareLinkLifecycleAction
        formValid={ctrl.formValid}
        activating={ctrl.activating}
        deactivating={ctrl.deactivating}
        active={ctrl.active}
        busy={ctrl.busy}
        isUpdating={ctrl.isUpdating}
        busyDots={ctrl.busyDots}
        onStart={ctrl.onStart}
        onStop={ctrl.onStop}
        restartReason={ctrl.restartReason}
      />
    </div>
  );
}
