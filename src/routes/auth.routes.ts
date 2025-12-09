import { Router } from "express";
import { UserApiService } from "../services/user-api.service";
import { JwtService } from "../services/jwt.service";
import { RefreshTokenService } from "../services/refresh-token.service";
import { OAuthService } from "../services/oauth.service";
import { requireAuth } from "../middleware/auth.middleware";
import { getClientIP, getUserAgent } from "../utils/request.utils";
import { REFRESH_TOKEN_EXPIRES_IN_MS } from "../constants/time";
import {
  setAuthCookies,
  clearAuthCookies,
  COOKIE_NAMES,
} from "../utils/cookie.utils";
import {
  loginSchema,
  oauthSchema,
  registerSchema,
  RegisterInput,
  LoginInput,
  OAuthInput,
} from "./auth.schemas";

export function createAuthRoutes(
  userApiService: UserApiService,
  jwtService: JwtService,
  refreshTokenService: RefreshTokenService,
  oauthService: OAuthService
) {
  const router = Router();

  router.post("/register", async (req, res) => {
    try {
      const parseResult = registerSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          message:
            parseResult.error.errors[0]?.message ||
            "Invalid request payload for register",
        });
      }

      const { email, username, password, phone }: RegisterInput =
        parseResult.data;

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

      setAuthCookies(res, accessToken, refreshToken);
      const response = {
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
      const parseResult = loginSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          message:
            parseResult.error.errors[0]?.message ||
            "Invalid request payload for login",
        });
      }

      const { identifier, identifierType, password }: LoginInput =
        parseResult.data;

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

      setAuthCookies(res, accessToken, refreshToken);

      const response = {
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
      const parseResult = oauthSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          message:
            parseResult.error.errors[0]?.message ||
            "Invalid request payload for oauth",
        });
      }

      const { email, provider, name }: OAuthInput = parseResult.data;

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

      setAuthCookies(res, accessToken, refreshToken);

      const response = {
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
      const refreshToken = req.cookies[COOKIE_NAMES.REFRESH_TOKEN];

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

      setAuthCookies(res, newAccessToken, newRefreshToken);

      const response = {
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
      const refreshToken = req.cookies[COOKIE_NAMES.REFRESH_TOKEN];

      if (refreshToken) {
        try {
          const payload = jwtService.verifyRefreshToken(refreshToken);
          await refreshTokenService.revokeToken(payload.tokenId);
        } catch (error) {}
      }

      clearAuthCookies(res);

      res.json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(400).json({ message: "Logout failed" });
    }
  });

  return router;
}
