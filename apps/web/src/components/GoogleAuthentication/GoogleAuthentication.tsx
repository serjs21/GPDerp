"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./style.module.css";

const GSI_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const COOKIE_NAME = "g_auth_credential";

export interface GoogleUser {
  sub: string;
  name: string;
  email: string;
  picture: string;
}

interface GoogleAuthenticationProps {
  clientId: string;
  onLogin?: (user: GoogleUser) => void;
  onLogout?: () => void;
}

// ── Cookie helpers ────────────────────────────────────────────────────────────

function setCookie(name: string, value: string, maxAgeDays = 7) {
  const maxAge = maxAgeDays * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Strict`;
}

function getCookie(name: string): string | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; max-age=0; path=/`;
}

// ── JWT payload decoder ───────────────────────────────────────────────────────

export function decodeJwtPayload(token: string): GoogleUser {
  const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  const json = atob(base64);
  return JSON.parse(json) as GoogleUser;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const GoogleAuthentication = ({
  clientId,
  onLogin,
  onLogout: _onLogout,
}: GoogleAuthenticationProps) => {
  void _onLogout;
  const [user, setUser] = useState<GoogleUser | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const initialised = useRef(false);

  const handleCredential = (credential: string) => {
    const profile = decodeJwtPayload(credential);
    setCookie(COOKIE_NAME, credential);
    setUser(profile);
    onLogin?.(profile);
  };

  useEffect(() => {
    // Restore session from cookie on mount
    const saved = getCookie(COOKIE_NAME);
    if (saved) {
      try {
        setUser(decodeJwtPayload(saved));
      } catch {
        deleteCookie(COOKIE_NAME);
      }
    }
  }, []);

  useEffect(() => {
    if (initialised.current) return;

    const initGsi = () => {
      if (!window.google?.accounts?.id) return;
      initialised.current = true;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: { credential: string }) => {
          handleCredential(response.credential);
        },
      });

      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "medium",
          shape: "rectangular",
          text: "signin_with",
        });
      }
    };

    // If script is already loaded (e.g. hot reload)
    if (window.google?.accounts?.id) {
      initGsi();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GSI_SCRIPT_SRC}"]`
    );

    if (existing) {
      existing.addEventListener("load", initGsi, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = GSI_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", initGsi, { once: true });
    document.head.appendChild(script);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  if (user) {
    return (
      <div className={styles.signedIn} data-testid="signed-in">
        <Image
          src={user.picture}
          alt={user.name}
          className={styles.avatar}
          width={32}
          height={32}
          unoptimized
          referrerPolicy="no-referrer"
        />
        <span className={styles.name}>{user.name}</span>
      </div>
    );
  }

  return (
    <div
      ref={buttonRef}
      className={styles.loginWrapper}
      data-testid="login-wrapper"
    />
  );
};

// ── Global type augmentation ──────────────────────────────────────────────────

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            nonce?: string;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            config: {
              type?: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              shape?: "rectangular" | "pill" | "circle" | "square";
              text?: string;
            }
          ) => void;
          prompt: (
            momentListener?: (notification: unknown) => void
          ) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}
