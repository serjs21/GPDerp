"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import type { AccountToUserObject, UserObject } from "@/types";
import Cookies from "js-cookie";
import { decodeJwt } from "jose";

type AuthMeResponse = {
  ok: boolean;
  data: {
    user: UserObject;
    account: AccountToUserObject[];
  };
};

const DEFAULT_USER: UserObject = {
  id: "",
  email: "",
  userName: "",
  firstName: "",
  lastName: "",
  emailVerifiedAt: null,
  providers: [],
};

export type AuthenticationState = {
  // Kept non-null to match the required hook contract.
  user: UserObject;
  account: AccountToUserObject[];
  // Becomes true once we've finished checking auth (success or logged-out).
  initialized: boolean;
};

export function useAuthentication(): AuthenticationState {
  const { initialState, hasValidAccessToken } = (() => {
    // `access_token` cookie is non-HttpOnly specifically to enable a fast init check.
    if (typeof document === "undefined") {
      return {
        initialState: { user: DEFAULT_USER, account: [], initialized: false },
        hasValidAccessToken: false,
      };
    }

    const token = Cookies.get("access_token");
    if (!token) {
      return { initialState: { user: DEFAULT_USER, account: [], initialized: true }, hasValidAccessToken: false };
    }

    try {
      const payload = decodeJwt(token) as { sub?: string; sid?: string; exp?: number };
      if (!payload?.sub || !payload?.sid || !payload?.exp) {
        return {
          initialState: { user: DEFAULT_USER, account: [], initialized: true },
          hasValidAccessToken: false,
        };
      }

      const expMs = payload.exp * 1000;
      if (expMs <= Date.now()) {
        return { initialState: { user: DEFAULT_USER, account: [], initialized: true }, hasValidAccessToken: false };
      }

      // Optimistic: we have a non-expired access JWT. We'll still verify server-side in background.
      return {
        initialState: {
          user: { ...DEFAULT_USER, id: payload.sub },
          account: [],
          initialized: true,
        },
        hasValidAccessToken: true,
      };
    } catch {
      return {
        initialState: { user: DEFAULT_USER, account: [], initialized: true },
        hasValidAccessToken: false,
      };
    }
  })();

  const [state, setState] = useState<AuthenticationState>(initialState);

  useEffect(() => {
    let cancelled = false;

    const setLoggedOut = () => {
      if (cancelled) return;
      setState((prev) => ({ ...prev, user: DEFAULT_USER, account: [] }));
    };

    const checkAuth = async () => {
      try {
        const res = await axios.get<AuthMeResponse>("/auth/me");
        if (cancelled) return;
        if (!res.data.ok) return setLoggedOut();

        setState((prev) => ({
          ...prev,
          user: res.data.data.user,
          account: res.data.data.account,
        }));
      } catch {
        setLoggedOut();
      }
    };

    const run = async () => {
      if (!hasValidAccessToken) {
        setLoggedOut();
        return;
      }
      try {
        await checkAuth();
      } finally {
        if (!cancelled) setState((prev) => ({ ...prev, initialized: true }));
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

