import { OAuth2Client } from "google-auth-library";
import { env } from "../../env";

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export type GoogleIdentity = {
  sub: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
};

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
    };
  },
};
