import passport from "passport";
import { Strategy, VerifyCallback, Profile } from "passport-google-oauth20";
import { GoogleUserPayload } from "../types";
import { config } from "../config";

export class GoogleStrategy {
  static initialize() {
    passport.use(
      new Strategy(
        {
          clientID: config.googleClientId,
          clientSecret: config.googleClientSecret,
          callbackURL: config.googleCallbackUrl,
          scope: ["email", "profile"],
        },
        (
          accessToken: string,
          _refreshToken: string | undefined,
          profile: Profile,
          done: VerifyCallback
        ) => {
          const { name, emails, photos } = profile;

          if (!emails || emails.length === 0 || !emails[0].value) {
            return done(
              new Error("No email found in Google profile"),
              undefined
            );
          }

          const user: GoogleUserPayload = {
            provider: "google",
            email: emails[0].value,
            name: name?.givenName,
            picture: photos?.[0]?.value,
            accessToken,
          };

          done(null, user);
        }
      )
    );
  }
}
