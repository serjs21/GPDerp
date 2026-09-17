"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import type { AccountToUserObject, UserObject } from "@/types";
import Cookies from "js-cookie";
import { decodeJwt } from "jose";
import { AUTH_REQUIRED_EVENT } from "@/axios.setup";

type AuthMeResponse = {
  ok: boolean;
  data: {
    user: UserObject;
    account: AccountToUserObject[];
  };
};

const EMPTY_USER: UserObject = {
  id: "",
  email: "",
  userName: null,
  firstName: "",
  lastName: "",
  avatar: "",
  avatarManuallySet: false,
  emailVerifiedAt: null,
  providers: [],
};

interface UnauthenticatedStateOptions {
  isInitialized: boolean;
}
const getUnauthenticatedState = ({
  isInitialized,
}: UnauthenticatedStateOptions = { isInitialized: true }): AuthenticationState => ({
  user: { ...EMPTY_USER },
  account: [],
  initialized: isInitialized,
});

export type AuthenticationState = {
  // Kept non-null to match the required hook contract.
  user: UserObject;
  account: AccountToUserObject[];
  // Becomes true once we've finished checking auth (success or logged-out).
  initialized: boolean;
};

export type AuthenticationResult = AuthenticationState & {
  isLoggedIn: boolean;
  logout: () => Promise<void>;
  checkAuthentication: () => void;
};

const AUTH_COOKIE_NAMES = ["access_token", "refresh_token", "csrf_token"] as const;

const clearClientAuthCookies = () => {
  for (const cookieName of AUTH_COOKIE_NAMES) {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
  }
};

export const useAuthentication = (): AuthenticationResult => {
  const setLoggedOut = () => {
    setAuthenticationState(getUnauthenticatedState());
  };

  const checkJWTAuthentication = (): {
    valid: boolean;
    shouldRefreshForMissingClaims: boolean;
    shouldAttemptRefresh: boolean;
  } => {
    // `access_token` cookie is non-HttpOnly specifically to enable a fast init check.
    if (typeof document === "undefined") {
      setLoggedOut();
      return { valid: false, shouldRefreshForMissingClaims: false, shouldAttemptRefresh: false };
    }

    const token = Cookies.get("access_token");
    if (!token) {
      return { valid: false, shouldRefreshForMissingClaims: false, shouldAttemptRefresh: true };
    }

    try {
      const payload = decodeJwt(token) as {
        sub?: string;
        sid?: string;
        exp?: number;
        userName?: string;
        avatar?: string;
        emailVerifiedAt?: string | null;
      };

      if (!payload?.sub || !payload?.sid || !payload?.exp) {
        return { valid: false, shouldRefreshForMissingClaims: false, shouldAttemptRefresh: true };
      }

      const expMs = payload.exp * 1000;
      if (expMs <= Date.now()) {
        return { valid: false, shouldRefreshForMissingClaims: false, shouldAttemptRefresh: true };
      }

      const hasUserNameClaim = typeof payload.userName === "string";
      const hasAvatarClaim = typeof payload.avatar === "string";
      const hasEmailVerifiedAtClaim =
        typeof payload.emailVerifiedAt === "string" || payload.emailVerifiedAt === null;

      // Optimistic: we have a non-expired access JWT. We'll still verify server-side in background.
      setAuthenticationState({
        user: {
          ...EMPTY_USER,
          id: payload.sub,
          userName:
            typeof payload.userName === "string" && payload.userName.length > 0 ? payload.userName : null,
          avatar: typeof payload.avatar === "string" ? payload.avatar : "",
          avatarManuallySet: false,
          emailVerifiedAt:
            typeof payload.emailVerifiedAt === "string" ? payload.emailVerifiedAt : null,
        },
        account: [],
        initialized: true,
      });
      return {
        valid: true,
        shouldRefreshForMissingClaims:
          !hasUserNameClaim || !hasAvatarClaim || !hasEmailVerifiedAtClaim,
        shouldAttemptRefresh: false,
      };
    } catch {
      return { valid: false, shouldRefreshForMissingClaims: false, shouldAttemptRefresh: true };
    }
  };

  const [authenticationState, setAuthenticationState] = useState<AuthenticationState>(
    getUnauthenticatedState({ isInitialized: false }),
  );

  const logout = async () => {
    try {
      await axios.post("/auth/logout");
    } catch {
      // Still clear client auth state/cookies even if API logout fails.
    } finally {
      clearClientAuthCookies();
      setLoggedOut();
    }
  };

  const fetchAuthUser = async () => {
    try {
      const result = await axios.get<AuthMeResponse>("/auth/me");
      if (!result.data.ok) return setLoggedOut();
      setAuthenticationState({
        initialized: true,
        user: result.data.data.user,
        account: result.data.data.account,
      });
    } catch {
      setLoggedOut();
    }
  };

  const checkAuthentication = () => {
    const jwtState = checkJWTAuthentication();
    if (!jwtState.valid) {
      if (jwtState.shouldAttemptRefresh) {
        axios
          .post("/auth/refresh")
          .then(fetchAuthUser)
          .catch(() => setLoggedOut());
      } else {
        setLoggedOut();
      }
      return;
    }

    if (jwtState.shouldRefreshForMissingClaims) {
      axios.post("/auth/refresh").then(fetchAuthUser).catch(() => fetchAuthUser());
      return;
    }
    fetchAuthUser();
  };

  // Intentionally run auth check once on mount; checkAuthentication has unstable references by design.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(checkAuthentication, []);

  // Stale session: 401 path clears client auth so UI matches the login modal.
  useEffect(() => {
    const onAuthRequired = () => {
      clearClientAuthCookies();
      setLoggedOut();
    };
    window.addEventListener(AUTH_REQUIRED_EVENT, onAuthRequired);
    return () => {
      window.removeEventListener(AUTH_REQUIRED_EVENT, onAuthRequired);
    };
  }, []);

  return { ...authenticationState, isLoggedIn: !!authenticationState?.user?.id, logout, checkAuthentication };
};

