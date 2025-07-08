import { OAuthUserPayload } from "../types";

export function isOAuthUserPayload(user: unknown): user is OAuthUserPayload {
  return (
    user !== null &&
    typeof user === "object" &&
    "provider" in user &&
    "email" in user &&
    (user.provider === "google" || user.provider === "facebook")
  );
}

export function serializeOAuthUser(user: unknown): OAuthUserPayload | null {
  if (isOAuthUserPayload(user)) {
    return {
      provider: user.provider,
      email: user.email,
      name: user.name,
      picture: user.picture,
      accessToken: user.accessToken,
    };
  }
  return null;
}

export function deserializeOAuthUser(
  sessionData: unknown
): OAuthUserPayload | null {
  if (isOAuthUserPayload(sessionData)) {
    return sessionData;
  }
  return null;
}
