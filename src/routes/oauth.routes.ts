import { Router } from "express";
import passport from "passport";
import { OAuthUserPayload } from "../types";
import { OAuthService } from "../services/oauth.service";
import { withOAuthUser } from "../middleware/oauth.middleware";
import { getClientIP, getUserAgent } from "../utils/request.utils";

export function createOAuthRoutes(oauthService: OAuthService) {
  const router = Router();

  router.get(
    "/google",
    passport.authenticate("google", { scope: ["email", "profile"] })
  );

  router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    withOAuthUser(async (req, res, user: OAuthUserPayload) => {
      try {
        const response = await oauthService.handleOAuthLogin(
          user,
          getClientIP(req),
          getUserAgent(req)
        );
        res.json(response);
      } catch (error) {
        res.status(500).json({
          message: "OAuth authentication failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    })
  );

  router.get(
    "/facebook",
    passport.authenticate("facebook", { scope: ["email", "public_profile"] })
  );

  router.get(
    "/facebook/callback",
    passport.authenticate("facebook", { failureRedirect: "/login" }),
    withOAuthUser(async (req, res, user: OAuthUserPayload) => {
      try {
        const response = await oauthService.handleOAuthLogin(
          user,
          getClientIP(req),
          getUserAgent(req)
        );
        res.json(response);
      } catch (error) {
        res.status(500).json({
          message: "OAuth authentication failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    })
  );

  return router;
}
