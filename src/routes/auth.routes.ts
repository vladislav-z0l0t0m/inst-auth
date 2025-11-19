import { Router } from "express";
import { LoginResponse, RefreshTokenRequest, RegisterRequest } from "../types";
import { UserApiService } from "../services/user-api.service";
import { JwtService } from "../services/jwt.service";
import { RefreshTokenService } from "../services/refresh-token.service";
import { OAuthService } from "../services/oauth.service";
import { requireAuth } from "../middleware/auth.middleware";
import { getClientIP, getUserAgent } from "../utils/request.utils";
import { REFRESH_TOKEN_EXPIRES_IN_MS } from "../constants/time";

export function createAuthRoutes(
  userApiService: UserApiService,
  jwtService: JwtService,
  refreshTokenService: RefreshTokenService,
  oauthService: OAuthService
) {
  const router = Router();

  router.post("/register", async (req, res) => {
    try {
      const { email, username, password, phone }: RegisterRequest = req.body;

      if (!email || !username || !password) {
        return res.status(400).json({
          message: "Missing required fields: email, username, password",
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: "Invalid email format",
        });
      }

      if (phone) {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phone)) {
          return res.status(400).json({
            message:
              "Invalid phone format. Use E.164 format (e.g., +1234567890)",
          });
        }
      }

      if (username.length < 3) {
        return res.status(400).json({
          message: "Username must be at least 3 characters long",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          message: "Password must be at least 6 characters long",
        });
      }

      const user = await userApiService.registerUser({
        email,
        username,
        password,
        phone,
      });

      if (!user) {
        return res.status(409).json({
          message: "User with this email or username already exists",
        });
      }

      const accessToken = jwtService.generateAccessToken({
        userId: user.id,
      });

      const refreshTokenValue = refreshTokenService.generateRefreshToken();
      const refreshToken = jwtService.generateRefreshToken({
        userId: user.id,
        tokenId: refreshTokenValue,
      });

      await refreshTokenService.createToken({
        userId: user.id,
        token: refreshTokenValue,
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS),
      });

      const response: LoginResponse = {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          phone: user.phone,
        },
      };

      res.status(201).json(response);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.post("/login", async (req, res) => {
    try {
      const { identifier, identifierType, password } = req.body;

      if (!identifier || !identifierType || !password) {
        return res.status(400).json({
          message:
            "Missing required fields: identifier, identifierType, password",
        });
      }

      if (!["email", "phone", "username"].includes(identifierType)) {
        return res.status(400).json({
          message: "Invalid identifierType. Must be email, phone, or username",
        });
      }

      const user = await userApiService.authenticateUser({
        identifier,
        identifierType,
        password,
      });

      if (!user) {
        return res
          .status(401)
          .json({ message: "Auth service: Invalid credentials" });
      }

      const accessToken = jwtService.generateAccessToken({
        userId: user.id,
      });

      const refreshTokenValue = refreshTokenService.generateRefreshToken();
      const refreshToken = jwtService.generateRefreshToken({
        userId: user.id,
        tokenId: refreshTokenValue,
      });

      await refreshTokenService.createToken({
        userId: user.id,
        token: refreshTokenValue,
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS),
      });

      const response: LoginResponse = {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          phone: user.phone,
        },
      };

      res.json(response);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.post("/oauth", async (req, res) => {
    try {
      const { email, provider, name } = req.body;

      if (!email || !provider) {
        return res.status(400).json({
          message: "Missing required fields: email, provider",
        });
      }

      if (!["google", "facebook"].includes(provider)) {
        return res.status(400).json({
          message: "Invalid provider. Must be google or facebook",
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: "Invalid email format",
        });
      }

      const user = await userApiService.handleOAuthLogin({
        email,
        provider,
        name,
      });

      if (!user) {
        return res
          .status(400)
          .json({ message: "Failed to process OAuth login" });
      }

      const accessToken = jwtService.generateAccessToken({
        userId: user.id,
      });

      const refreshTokenValue = refreshTokenService.generateRefreshToken();
      const refreshToken = jwtService.generateRefreshToken({
        userId: user.id,
        tokenId: refreshTokenValue,
      });

      await refreshTokenService.createToken({
        userId: user.id,
        token: refreshTokenValue,
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS),
      });

      const response: LoginResponse = {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          phone: user.phone,
        },
      };

      res.json(response);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.post("/refresh", async (req, res) => {
    try {
      const { refreshToken }: RefreshTokenRequest = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          message: "Missing refresh token",
        });
      }

      const payload = jwtService.verifyRefreshToken(refreshToken);

      const storedToken = await refreshTokenService.findByToken(
        payload.tokenId
      );

      if (!storedToken || storedToken.userId !== payload.userId) {
        return res.status(401).json({
          message: "Invalid refresh token",
        });
      }

      const user = await userApiService.getUserById(payload.userId);

      if (!user) {
        return res.status(401).json({
          message: "User not found",
        });
      }

      const newAccessToken = jwtService.generateAccessToken({
        userId: user.id,
      });

      const newRefreshTokenValue = refreshTokenService.generateRefreshToken();
      const newRefreshToken = jwtService.generateRefreshToken({
        userId: user.id,
        tokenId: newRefreshTokenValue,
      });

      await refreshTokenService.revokeToken(payload.tokenId);
      await refreshTokenService.createToken({
        userId: user.id,
        token: newRefreshTokenValue,
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS),
      });

      const response: LoginResponse = {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          phone: user.phone,
        },
      };

      res.json(response);
    } catch (error) {
      res.status(401).json({ message: "Invalid refresh token" });
    }
  });

  router.post("/logout", requireAuth, async (req, res) => {
    try {
      const { refreshToken }: RefreshTokenRequest = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          message: "Missing refresh token",
        });
      }

      const payload = jwtService.verifyRefreshToken(refreshToken);

      const success = await refreshTokenService.revokeToken(payload.tokenId);

      if (!success) {
        return res.status(400).json({
          message: "Token already revoked or invalid",
        });
      }

      res.json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(400).json({ message: "Invalid refresh token" });
    }
  });

  return router;
}
