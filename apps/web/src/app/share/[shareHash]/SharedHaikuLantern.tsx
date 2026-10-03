"use client";

import { useMemo } from "react";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { LabelHalo, toLabelHaloItems } from "@/components/LabelHalo";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import { SVG_PATH_LANTERN_WIDTH_REM } from "@/components/SVGPath/consts/pathLanternLayoutConsts";
import type { SharedHaikuLanternProps } from "./SharedHaikuLantern.types";
import { sharedHaikuFlyInStyle } from "./utils/sharedHaikuFlyInUtils";
import styles from "./SharedHaikuLantern.module.css";

export function SharedHaikuLantern({ haiku, showLabels, subject }: SharedHaikuLanternProps) {
  // App loader overlay hides once auth is initialized — don't play the entrance underneath it.
  const { initialized } = useAuthenticationState();

  // LabelHalo syncs `labels` into state on identity change — keep it stable.
  const labels = useMemo(
    () => (showLabels ? toLabelHaloItems(haiku.labels ?? []) : []),
    [showLabels, haiku.labels],
  );

  const lantern = (
    <LanternFrame
      ariaLabel={`Haiku lantern: ${subject}`}
      widthRem={SVG_PATH_LANTERN_WIDTH_REM}
      showLabelBelt={false}
    >
      <Lantern haiku={haiku} showActions={false} typing />
    </LanternFrame>
  );

  return (
    <div
      className={[styles.root, initialized && styles.animate].filter(Boolean).join(" ")}
      style={sharedHaikuFlyInStyle()}
    >
      <div className={styles.flyIn}>
        {labels.length > 0 ? (
          <LabelHalo labels={labels} interactive={false} ariaLabel={`${subject} labels`}>
            {lantern}
          </LabelHalo>
        ) : (
          lantern
        )}
      </div>
    </div>
  );
}
