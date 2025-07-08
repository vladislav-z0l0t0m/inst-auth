import { Router } from "express";
import { RefreshTokenService } from "../services/refresh-token.service";
import { requireAuth } from "../middleware/auth.middleware";

export function createAdminRoutes(refreshTokenService: RefreshTokenService) {
  const router = Router();

  router.use(requireAuth);

  router.delete("/admin/tokens/all", async (req, res) => {
    try {
      const revokedCount = await refreshTokenService.revokeAllTokens();

      if (revokedCount === 0) {
        res.json({
          message: "No active tokens found for any user",
          revokedCount,
        });
      } else {
        res.json({
          message: `Successfully revoked ${revokedCount} tokens for all users`,
          revokedCount,
        });
      }
    } catch (error) {
      console.error("Error revoking all tokens:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.delete("/admin/tokens/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);

      if (isNaN(userId)) {
        return res.status(400).json({
          message: "Invalid userId parameter",
        });
      }

      const revokedCount = await refreshTokenService.revokeAllUserTokens(
        userId
      );

      if (revokedCount === 0) {
        res.json({
          message: `No active tokens found for user ${userId}`,
          revokedCount,
        });
      } else {
        res.json({
          message: `Successfully revoked ${revokedCount} tokens for user ${userId}`,
          revokedCount,
        });
      }
    } catch (error) {
      console.error("Error revoking user tokens:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return router;
}
