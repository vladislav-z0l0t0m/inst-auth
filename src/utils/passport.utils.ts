import { OAuthUserPayload } from "../types";

// Type guard function
export function isOAuthUserPayload(user: unknown): user is OAuthUserPayload {
  return (
    user !== null &&
    typeof user === "object" &&
    "provider" in user &&
    "email" in user &&
    (user.provider === "google" || user.provider === "facebook")
  );
}

// Safe serialization function
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

// Safe deserialization function
export function deserializeOAuthUser(
  sessionData: unknown
): OAuthUserPayload | null {
  if (isOAuthUserPayload(sessionData)) {
    return sessionData;
  }
  return null;
}
