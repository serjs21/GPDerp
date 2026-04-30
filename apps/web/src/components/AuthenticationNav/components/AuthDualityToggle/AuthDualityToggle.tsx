import "./auth-duality-toggle.css";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { TextToIcon } from "../TextToIcon/TextToIcon";
import { type SettledMode, useAuthToggleSideTransitions } from "./useAuthToggleSideTransitions";
import { useDualitySeamAnimation } from "./useDualitySeamAnimation";

type AuthSide = "login" | "register";

type AuthDualityToggleProps = {
  loginLabel?: string;
  registerLabel?: string;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  onClose?: number;
  borderRadius?: number;
  width?: number;
  height?: number;
};

const DEFAULT_WIDTH = 320;
const DEFAULT_HEIGHT = 44;
const RESIZE_EASE_IN = [0.4, 0, 1, 1] as const;
const LABEL_WIDTH_PADDING_PX = 8;
const SEAM_CLEARANCE_PX = 16;

export function AuthDualityToggle({
  loginLabel = "Login",
  registerLabel = "Register",
  onLoginClick,
  onRegisterClick,
  onClose,
  borderRadius = 999,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
}: AuthDualityToggleProps) {
  const reduceMotion = useReducedMotion();
  const lockedSelectedSideRef = useRef<AuthSide | null>(null);
  const isSelectionLockedRef = useRef(false);
  const suppressHoverUntilNextPointerEnterRef = useRef(false);
  const closeTokenRef = useRef<number | undefined>(onClose);
  const seamRef = useRef<SVGPathElement>(null);
  const yingRef = useRef<SVGPathElement>(null);
  const loginMeasureRef = useRef<HTMLSpanElement>(null);
  const registerMeasureRef = useRef<HTMLSpanElement>(null);
  const [loginLabelMinimumWidth, setLoginLabelMinimumWidth] = useState(0);
  const [registerLabelMinimumWidth, setRegisterLabelMinimumWidth] = useState(0);

  const {
    hoveredSide,
    loginWidth,
    registerWidth,
    resizeDurationSeconds,
    loginTargetMode,
    registerTargetMode,
    loginDelayMilliseconds,
    registerDelayMilliseconds,
    loginTransitionDurationMilliseconds,
    registerTransitionDurationMilliseconds,
    loginTransitionKey,
    registerTransitionKey,
    setHoveredIntent,
  } = useAuthToggleSideTransitions({
    width,
    height,
    loginLabelMinimumWidth,
    registerLabelMinimumWidth,
  });

  useEffect(() => {
    if (onClose === undefined) return;
    if (closeTokenRef.current === undefined) {
      closeTokenRef.current = onClose;
      return;
    }
    if (closeTokenRef.current !== onClose) {
      closeTokenRef.current = onClose;
      lockedSelectedSideRef.current = null;
      isSelectionLockedRef.current = false;
      suppressHoverUntilNextPointerEnterRef.current = true;
      setHoveredIntent(null);
    }
  }, [onClose, setHoveredIntent]);

  const effectiveHoveredSide = hoveredSide;
  const loginDominant = effectiveHoveredSide === "login";
  const registerDominant = effectiveHoveredSide === "register";
  const loginRenderTargetMode: SettledMode = loginWidth < loginLabelMinimumWidth ? "icon" : loginTargetMode;
  const registerRenderTargetMode: SettledMode =
    registerWidth < registerLabelMinimumWidth ? "icon" : registerTargetMode;
  const resizeTransition = { type: "tween" as const, duration: resizeDurationSeconds, ease: RESIZE_EASE_IN };

  useEffect(() => {
    if (loginMeasureRef.current) {
      const measuredWidth =
        loginMeasureRef.current.getBoundingClientRect().width + LABEL_WIDTH_PADDING_PX + SEAM_CLEARANCE_PX * 2;
      setLoginLabelMinimumWidth(measuredWidth);
    }
    if (registerMeasureRef.current) {
      const measuredWidth =
        registerMeasureRef.current.getBoundingClientRect().width + LABEL_WIDTH_PADDING_PX + SEAM_CLEARANCE_PX * 2;
      setRegisterLabelMinimumWidth(measuredWidth);
    }
  }, [loginLabel, registerLabel]);

  useDualitySeamAnimation({
    height,
    loginWidth,
    resizeDurationSeconds,
    hoveredSide: effectiveHoveredSide,
    reduceMotion,
    seamRef,
    yingRef,
  });

  const handleButtonClick = (clickedSide: AuthSide) => {
    if (isSelectionLockedRef.current && lockedSelectedSideRef.current !== clickedSide) return;
    lockedSelectedSideRef.current = clickedSide;
    isSelectionLockedRef.current = true;
    setHoveredIntent(clickedSide);
    if (clickedSide === "login") {
      onLoginClick?.();
      return;
    }
    onRegisterClick?.();
  };

  const handleHoverIntent = (side: AuthSide | null) => {
    if (isSelectionLockedRef.current) return;
    setHoveredIntent(side);
  };

  const handlePointerEnterIntent = (side: AuthSide) => {
    suppressHoverUntilNextPointerEnterRef.current = false;
    handleHoverIntent(side);
  };

  const handleFocusIntent = (side: AuthSide) => {
    if (suppressHoverUntilNextPointerEnterRef.current) return;
    handleHoverIntent(side);
  };

  return (
    <div
      className="syl-anime-root"
      data-testid="auth-duality-toggle"
      onPointerLeave={() => handleHoverIntent(null)}
      style={{ width, height, borderRadius }}
    >
      <svg className="syl-anime-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden>
        <rect x="0" y="0" width={width} height={height} className="syl-anime-yang" />
        <path ref={yingRef} className="syl-anime-ying" />
        <path ref={seamRef} className="syl-anime-seam" />
      </svg>

      <div className="syl-anime-options">
        <span ref={loginMeasureRef} className="syl-anime-measure">
          {loginLabel}
        </span>
        <span ref={registerMeasureRef} className="syl-anime-measure">
          {registerLabel}
        </span>
        <motion.button
          type="button"
          className="syl-anime-btn syl-anime-btn-login"
          initial={false}
          animate={{ width: loginWidth }}
          transition={resizeTransition}
          onPointerEnter={() => handlePointerEnterIntent("login")}
          onFocus={() => handleFocusIntent("login")}
          onClick={() => handleButtonClick("login")}
          aria-label={loginLabel}
        >
          <TextToIcon
            side="login"
            label={loginLabel}
            dominant={loginDominant}
            targetMode={loginRenderTargetMode}
            canShowText={loginWidth >= loginLabelMinimumWidth}
            transitionDelayMs={loginDelayMilliseconds}
            transitionDurationMs={loginTransitionDurationMilliseconds}
            transitionKey={loginTransitionKey}
          />
        </motion.button>

        <motion.button
          type="button"
          className="syl-anime-btn syl-anime-btn-register"
          initial={false}
          animate={{ width: registerWidth }}
          transition={resizeTransition}
          onPointerEnter={() => handlePointerEnterIntent("register")}
          onFocus={() => handleFocusIntent("register")}
          onClick={() => handleButtonClick("register")}
          aria-label={registerLabel}
        >
          <TextToIcon
            side="register"
            label={registerLabel}
            dominant={registerDominant}
            targetMode={registerRenderTargetMode}
            canShowText={registerWidth >= registerLabelMinimumWidth}
            transitionDelayMs={registerDelayMilliseconds}
            transitionDurationMs={registerTransitionDurationMilliseconds}
            transitionKey={registerTransitionKey}
          />
        </motion.button>
      </div>
    </div>
  );
}
