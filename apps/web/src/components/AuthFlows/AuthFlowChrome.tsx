"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import authStyles from "@/app/auth.shared.module.css";

/** Matches Google Identity Services outline hover wash. */
const GOOGLE_HOVER_WASH = "#e8f0fe";
const BURST_FILL = "#17131A";
const BURST_FONT_SIZE = 20;
const BURST_PADDING_X = 28;
const BURST_PADDING_Y = 10;

type GoogleSquareButtonProps = {
  text: "signin_with" | "signup_with";
  onSuccess: (credential: string | undefined) => void;
  onError: () => void;
};

function googleLabel(text: GoogleSquareButtonProps["text"]): string {
  return text === "signup_with" ? "Sign up with Google" : "Sign in with Google";
}

/** Official multicolor G — colors must stay unmodified per Google branding. */
function GoogleGMark() {
  return (
    <svg
      className={authStyles.googleMark}
      viewBox="0 0 48 48"
      width={28}
      height={28}
      aria-hidden
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

/**
 * Comic burst label that opens Google’s OAuth popup (access token).
 * Call sites still receive the token via `onSuccess` for `/auth/google/*`.
 */
export function GoogleSquareButton({ text, onSuccess, onError }: GoogleSquareButtonProps) {
  const [hovering, setHovering] = useState(false);
  const label = googleLabel(text);

  const startGoogleLogin = useGoogleLogin({
    flow: "implicit",
    scope: "openid email profile",
    onSuccess: (tokenResponse) => {
      onSuccess(tokenResponse.access_token);
    },
    onError: () => {
      onError();
    },
  });

  return (
    <div className={authStyles.googleRow}>
      <ComicPagePanel
        background="solid"
        color="white"
        contentAlign="center"
        className={[authStyles.googleSquare, hovering ? authStyles.googleSquareHover : ""]
          .filter(Boolean)
          .join(" ")}
        style={
          hovering
            ? ({ "--comic-panel-base": GOOGLE_HOVER_WASH } as CSSProperties)
            : undefined
        }
      >
        <button
          type="button"
          className={authStyles.googleAction}
          aria-label={label}
          onPointerEnter={() => setHovering(true)}
          onPointerLeave={() => setHovering(false)}
          onClick={() => {
            startGoogleLogin();
          }}
        >
          <GoogleGMark />
          <ComicBurstLabel
            className={authStyles.googleBurst}
            text={formatComicLabelText(label)}
            fill={BURST_FILL}
            shapeKind="rect"
            seed={`google-${text}`}
            fontSize={BURST_FONT_SIZE}
            paddingX={BURST_PADDING_X}
            paddingY={BURST_PADDING_Y}
            strokeWidth={3}
          />
        </button>
      </ComicPagePanel>
    </div>
  );
}

type AuthFieldProps = {
  label: string;
  children: ReactNode;
};

export function AuthField({ label, children }: AuthFieldProps) {
  return (
    <label className={authStyles.field}>
      <span className={authStyles.fieldLabel}>{label}</span>
      <ComicPagePanel background="solid" color="white" className={authStyles.fieldPanel}>
        {children}
      </ComicPagePanel>
    </label>
  );
}
