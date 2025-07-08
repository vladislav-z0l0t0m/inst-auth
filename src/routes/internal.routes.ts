import { Router } from "express";
import { RefreshTokenService } from "../services/refresh-token.service";
import { internalAuthMiddleware } from "../middleware/internal-auth.middleware";

export function createInternalRoutes(refreshTokenService: RefreshTokenService) {
  const router = Router();

  router.post(
    "/internal/auth/revoke-user-tokens",
    internalAuthMiddleware,
    async (req, res) => {
      try {
        const { userId } = req.body;

        if (!userId || typeof userId !== "number") {
          return res.status(400).json({
            message: "Missing or invalid userId",
          });
        }

        const revokedCount = await refreshTokenService.revokeAllUserTokens(
          userId
        );

        res.json({
          message: `Successfully revoked ${revokedCount} tokens for user ${userId}`,
          revokedCount,
        });
      } catch (error) {
        console.error("Error revoking user tokens:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  return router;
}
