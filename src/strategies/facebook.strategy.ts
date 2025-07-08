import passport from "passport";
import { Strategy, Profile } from "passport-facebook";
import { FacebookUserPayload } from "../types";
import { config } from "../config";

export class FacebookStrategy {
  static initialize() {
    passport.use(
      new Strategy(
        {
          clientID: config.facebookAppId,
          clientSecret: config.facebookAppSecret,
          callbackURL: config.facebookCallbackUrl,
          profileFields: ["name", "email", "picture"],
        },
        (
          accessToken: string,
          _refreshToken: string | undefined,
          profile: Profile,
          done: (err?: Error | null, user?: FacebookUserPayload) => void
        ) => {
          const { displayName, emails, photos } = profile;

          if (!emails || !emails[0]?.value) {
            return done(
              new Error("No primary email found in Facebook profile"),
              undefined
            );
          }

          const userPayload: FacebookUserPayload = {
            provider: "facebook",
            email: emails[0].value,
            name: displayName,
            picture: photos?.[0]?.value,
            accessToken,
          };

          done(null, userPayload);
        }
      )
    );
  }
}
