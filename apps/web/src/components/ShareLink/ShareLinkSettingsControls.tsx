"use client";

import type { Dispatch, SetStateAction } from "react";
import type { RestartLinkReason } from "@/components/RestartLinkButton";
import styles from "./ShareLink.module.css";
import { ShareLinkLifecycleAction } from "./ShareLinkLifecycleAction";
import { ShareLinkLimitInputs } from "./ShareLinkLimitInputs";
import { ShareLinkUpdateLimitsButton } from "./ShareLinkUpdateLimitsButton";
import type { LimitForm } from "./useShareLinkControls";

export type ShareLinkSettingsControlsProps = {
  form: LimitForm;
  setForm: Dispatch<SetStateAction<LimitForm>>;
  limitsLocked: boolean;
  formValid: boolean;
  showUpdate: boolean;
  updatingLimits: boolean;
  activating: boolean;
  deactivating: boolean;
  active: boolean;
  busy: boolean;
  isUpdating: boolean;
  busyDots: string;
  onUpdateLimits: () => void | Promise<void>;
  onStart: () => void | Promise<void>;
  onStop: () => void | Promise<void>;
  stopButtonClassName?: string;
  restartReason?: RestartLinkReason | null;
  /** Omit the inline Update button (e.g. when a ShareLinkActions column owns it). */
  hideUpdate?: boolean;
  /** Omit Launch/Stop/Restart (e.g. when the parent renders ShareLinkLifecycleAction elsewhere). */
  hideLifecycleAction?: boolean;
};

export function ShareLinkSettingsControls({
  form,
  setForm,
  limitsLocked,
  formValid,
  showUpdate,
  updatingLimits,
  activating,
  deactivating,
  active,
  busy,
  isUpdating,
  busyDots,
  onUpdateLimits,
  onStart,
  onStop,
  stopButtonClassName,
  restartReason,
  hideUpdate,
  hideLifecycleAction,
}: ShareLinkSettingsControlsProps) {
  const updateVisible = showUpdate && !hideUpdate;

  return (
    <>
      <div className={styles.limitsRow}>
        <ShareLinkLimitInputs form={form} setForm={setForm} limitsLocked={limitsLocked} />
        {updateVisible ? (
          <ShareLinkUpdateLimitsButton
            updatingLimits={updatingLimits}
            busyDots={busyDots}
            onUpdateLimits={onUpdateLimits}
            formValid={formValid}
            isUpdating={isUpdating}
            busy={busy}
          />
        ) : null}
      </div>

      {hideLifecycleAction ? null : (
        <ShareLinkLifecycleAction
          formValid={formValid}
          activating={activating}
          deactivating={deactivating}
          active={active}
          busy={busy}
          isUpdating={isUpdating}
          busyDots={busyDots}
          onStart={onStart}
          onStop={onStop}
          stopButtonClassName={stopButtonClassName}
          restartReason={restartReason}
        />
      )}
    </>
  );
}
