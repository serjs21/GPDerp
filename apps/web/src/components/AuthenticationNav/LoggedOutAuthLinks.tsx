"use client";

import { useState } from "react";
import { useReducedMotion } from "motion/react";
import { useAuthenticationVerification } from "@/app/providers/AuthenticationVerificationProvider";
import { AuthNavYinBackgroundLayer, YinYangSegmentBackground } from "./AuthNavYinBackground";
import { AuthNavYinSegmentControl } from "./AuthNavYinSegment";
import {
  AUTH_NAV_YIN_HOVER_DUR_REDUCED_S,
  AUTH_NAV_YIN_HOVER_DUR_S,
  authNavYinEase,
  authNavYinFastFadeEase,
  authNavYinHitOpacity,
  authNavYinSegmentFlex,
  type AuthNavYinHovered,
} from "./authNavYinMotion";
import styles from "./style.module.css";

export const LoggedOutAuthLinks = () => {
  const { openAuthenticationModal } = useAuthenticationVerification();
  const [hovered, setHovered] = useState<AuthNavYinHovered>(null);
  const reduceMotion = useReducedMotion();

  const segmentTr = reduceMotion
    ? { duration: 0.08 }
    : { type: "tween" as const, duration: hovered !== null ? AUTH_NAV_YIN_HOVER_DUR_S : 0.2, ease: authNavYinEase };
  const hitOpacityTr = reduceMotion
    ? { duration: 0.08 }
    : { type: "tween" as const, duration: hovered !== null ? 0.1 : 0.12, ease: authNavYinFastFadeEase };

  const tapScale = reduceMotion ? undefined : { scale: 0.97 };

  return (
    <nav className={styles.headerAuthNav} aria-label="Account">
      <div
        className={styles.authNavYinYang}
        data-testid="auth-yin-pill"
        data-auth-yin-hover={hovered ?? "idle"}
        data-auth-yin-phase={hovered ? "split" : "seam"}
        onPointerLeave={() => setHovered(null)}
      >
        <AuthNavYinBackgroundLayer
          hovered={hovered}
          reduceMotion={!!reduceMotion}
          phase={hovered ? "split" : "seam"}
        />

        <div className={styles.authNavYinLinks}>
          <AuthNavYinSegmentControl
            segment="login"
            hovered={hovered}
            onHover={setHovered}
            onClick={() => openAuthenticationModal("login")}
            segmentTransition={segmentTr}
            hitTransition={hitOpacityTr}
            tapScale={tapScale}
          />
          <AuthNavYinSegmentControl
            segment="register"
            hovered={hovered}
            onHover={setHovered}
            onClick={() => openAuthenticationModal("register")}
            segmentTransition={segmentTr}
            hitTransition={hitOpacityTr}
            tapScale={tapScale}
          />
        </div>
      </div>
    </nav>
  );
};

export {
  AUTH_NAV_YIN_HOVER_DUR_REDUCED_S,
  AUTH_NAV_YIN_HOVER_DUR_S,
  authNavYinHitOpacity,
  authNavYinSegmentFlex,
  type AuthNavYinHovered,
  YinYangSegmentBackground,
};

/** @deprecated Use AUTH_NAV_YIN_HOVER_DUR_S */
export const AUTH_NAV_YIN_LIQUID_DUR_S = AUTH_NAV_YIN_HOVER_DUR_S;
export const AUTH_NAV_YIN_LIQUID_DUR_REDUCED_S = AUTH_NAV_YIN_HOVER_DUR_REDUCED_S;
