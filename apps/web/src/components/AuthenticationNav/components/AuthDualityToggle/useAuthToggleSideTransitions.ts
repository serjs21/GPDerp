import { useMemo, useState } from "react";
import { computeCrossingDelay, DISAPPEAR_DURATION_S } from "./authToggleMotion";

export type AuthSide = "login" | "register";
export type SettledMode = "text" | "icon";

const RESIZE_EXIT_S = 0.6;
const RESIZE_INITIAL_S = DISAPPEAR_DURATION_S;
const RESIZE_SWITCH_S = DISAPPEAR_DURATION_S;

type UseAuthToggleSideTransitionsParams = {
  width: number;
  height: number;
  loginLabelMinimumWidth: number;
  registerLabelMinimumWidth: number;
};

export function useAuthToggleSideTransitions({
  width,
  height,
  loginLabelMinimumWidth,
  registerLabelMinimumWidth,
}: UseAuthToggleSideTransitionsParams) {
  const secondaryWidth = height;
  const [hoveredSide, setHoveredSide] = useState<AuthSide | null>(null);
  const [resizeDurationSeconds, setResizeDurationSeconds] = useState(RESIZE_EXIT_S);
  const [loginTransitionKey, setLoginTransitionKey] = useState(0);
  const [registerTransitionKey, setRegisterTransitionKey] = useState(0);
  const [loginTargetMode, setLoginTargetMode] = useState<SettledMode>("text");
  const [registerTargetMode, setRegisterTargetMode] = useState<SettledMode>("text");
  const [loginDelayMilliseconds, setLoginDelayMilliseconds] = useState(0);
  const [registerDelayMilliseconds, setRegisterDelayMilliseconds] = useState(0);
  const [loginTransitionDurationMilliseconds, setLoginTransitionDurationMilliseconds] = useState(
    Math.round(DISAPPEAR_DURATION_S * 1000),
  );
  const [registerTransitionDurationMilliseconds, setRegisterTransitionDurationMilliseconds] = useState(
    Math.round(DISAPPEAR_DURATION_S * 1000),
  );
  const loginWidth = useMemo(() => {
    if (!hoveredSide) return width / 2;
    return hoveredSide === "register" ? secondaryWidth : width - secondaryWidth;
  }, [hoveredSide, secondaryWidth, width]);
  const registerWidth = width - loginWidth;

  const setSideTransition = (
    side: AuthSide,
    startWidth: number,
    endWidth: number,
    requiredWidth: number,
    durationSeconds: number,
  ) => {
    const startFitsText = startWidth >= requiredWidth;
    const endFitsText = endWidth >= requiredWidth;
    const targetMode: SettledMode = endFitsText ? "text" : "icon";
    const delayMilliseconds =
      targetMode === "icon" || startFitsText === endFitsText
        ? 0
        : Math.max(
            0,
            Math.round(computeCrossingDelay(startWidth, endWidth, requiredWidth, durationSeconds) * 1000),
          );
    const durationMilliseconds = Math.max(1, Math.round(durationSeconds * 1000));

    if (side === "login") {
      setLoginTargetMode(targetMode);
      setLoginDelayMilliseconds(delayMilliseconds);
      setLoginTransitionDurationMilliseconds(durationMilliseconds);
      setLoginTransitionKey((previous) => previous + 1);
      return;
    }

    setRegisterTargetMode(targetMode);
    setRegisterDelayMilliseconds(delayMilliseconds);
    setRegisterTransitionDurationMilliseconds(durationMilliseconds);
    setRegisterTransitionKey((previous) => previous + 1);
  };

  const setHoveredIntent = (nextHoveredSide: AuthSide | null) => {
    const startLoginWidth = loginWidth;
    const startRegisterWidth = registerWidth;
    const nextLoginWidth =
      nextHoveredSide === null
        ? width / 2
        : nextHoveredSide === "register"
          ? secondaryWidth
          : width - secondaryWidth;
    const nextRegisterWidth = width - nextLoginWidth;

    const nextDurationSeconds =
      nextHoveredSide === null
        ? RESIZE_EXIT_S
        : hoveredSide === null || hoveredSide === nextHoveredSide
          ? RESIZE_INITIAL_S
          : RESIZE_SWITCH_S;

    setResizeDurationSeconds(nextDurationSeconds);
    setSideTransition("login", startLoginWidth, nextLoginWidth, loginLabelMinimumWidth, nextDurationSeconds);
    setSideTransition(
      "register",
      startRegisterWidth,
      nextRegisterWidth,
      registerLabelMinimumWidth,
      nextDurationSeconds,
    );
    setHoveredSide(nextHoveredSide);
  };

  return {
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
  };
}
