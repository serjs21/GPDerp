"use client";

import type { ReactNode } from "react";
import { GoogleLoginButton } from "@/components/StyledComponents";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import authStyles from "@/app/auth.shared.module.css";

type GoogleSquareButtonProps = {
  text: "signin_with" | "signup_with";
  onSuccess: (credential: string | undefined) => void;
  onError: () => void;
};

/** White square comic panel hosting the Google OAuth control. */
export function GoogleSquareButton({ text, onSuccess, onError }: GoogleSquareButtonProps) {
  return (
    <div className={authStyles.googleRow}>
      <ComicPagePanel
        background="solid"
        color="white"
        contentAlign="center"
        className={authStyles.googleSquare}
        ariaLabel={text === "signin_with" ? "Sign in with Google" : "Sign up with Google"}
      >
        <div className={authStyles.googleSquareInner}>
          <GoogleLoginButton
            onSuccess={(c) => onSuccess(c.credential)}
            onError={onError}
            text={text}
            type="icon"
            shape="square"
            theme="outline"
            size="large"
          />
        </div>
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
