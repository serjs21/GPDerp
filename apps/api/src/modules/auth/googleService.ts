import { OAuth2Client } from "google-auth-library";
import { env } from "../../env";

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

const USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

export type GoogleIdentity = {
  sub: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  avatar: string;
};

type GoogleUserInfo = {
  sub?: string;
  email?: string;
  email_verified?: boolean | string;
  given_name?: string;
  family_name?: string;
  picture?: string;
};

function looksLikeJwt(token: string): boolean {
  // Google OAuth access tokens are opaque (`ya29.…`) and must never go through ID-token verify.
  if (token.startsWith("ya29.")) return false;
  const parts = token.split(".");
  return parts.length === 3 && parts.every((part) => part.length > 0);
}

export const googleService = {
  async verifyIdToken(idToken: string): Promise<GoogleIdentity> {
    if (!env.GOOGLE_CLIENT_ID) {
      throw new Error("GOOGLE_CLIENT_ID is not configured");
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email || payload.email_verified !== true) {
      throw new Error("Google email missing or not verified");
    }

    return {
      sub: payload.sub,
      email: payload.email,
      emailVerified: payload.email_verified === true,
      firstName: payload.given_name ?? "",
      lastName: payload.family_name ?? "",
      avatar: payload.picture ?? "",
    };
  },

  async verifyAccessToken(accessToken: string): Promise<GoogleIdentity> {
    if (!env.GOOGLE_CLIENT_ID) {
      throw new Error("GOOGLE_CLIENT_ID is not configured");
    }

    const tokenInfo = await client.getTokenInfo(accessToken);
    if (tokenInfo.aud && tokenInfo.aud !== env.GOOGLE_CLIENT_ID) {
      throw new Error("Google access token audience mismatch");
    }

    const response = await fetch(USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      throw new Error(`Google userinfo failed (${response.status})`);
    }

    const profile = (await response.json()) as GoogleUserInfo;
    const email = profile.email ?? tokenInfo.email;
    const emailVerified =
      profile.email_verified === true ||
      profile.email_verified === "true" ||
      tokenInfo.email_verified === true;

    if (!email || !emailVerified) {
      throw new Error("Google email missing or not verified");
    }

    const sub = profile.sub ?? tokenInfo.sub;
    if (!sub) {
      throw new Error("Google subject missing");
    }

    return {
      sub,
      email,
      emailVerified: true,
      firstName: profile.given_name ?? "",
      lastName: profile.family_name ?? "",
      avatar: profile.picture ?? "",
    };
  },

  /** Accepts GIS ID tokens (JWT) or OAuth access tokens from custom button popup. */
  async verifyGoogleToken(token: string): Promise<GoogleIdentity> {
    if (looksLikeJwt(token)) {
      try {
        return await googleService.verifyIdToken(token);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        // Fallback if an opaque token was misclassified as JWT.
        if (message.includes("Wrong number of segments")) {
          return googleService.verifyAccessToken(token);
        }
        throw err;
      }
    }
    return googleService.verifyAccessToken(token);
  },
};
