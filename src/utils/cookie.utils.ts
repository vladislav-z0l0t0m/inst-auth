import { Response } from "express";
import { config, NodeEnv } from "../config";
import {
  ACCESS_TOKEN_EXPIRES_IN_MS,
  REFRESH_TOKEN_EXPIRES_IN_MS,
} from "../constants/time";

export const COOKIE_NAMES = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
} as const;

export function getAccessTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: config.nodeEnv === NodeEnv.PRODUCTION,
    sameSite: "strict" as const,
    maxAge: ACCESS_TOKEN_EXPIRES_IN_MS,
    path: "/",
  };
}

export function getRefreshTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: config.nodeEnv === NodeEnv.PRODUCTION,
    sameSite: "strict" as const,
    maxAge: REFRESH_TOKEN_EXPIRES_IN_MS,
    path: "/",
  };
}

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
) {
  res.cookie(
    COOKIE_NAMES.ACCESS_TOKEN,
    accessToken,
    getAccessTokenCookieOptions()
  );
  res.cookie(
    COOKIE_NAMES.REFRESH_TOKEN,
    refreshToken,
    getRefreshTokenCookieOptions()
  );
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, {
    httpOnly: true,
    secure: config.nodeEnv === NodeEnv.PRODUCTION,
    sameSite: "strict",
    path: "/",
  });
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, {
    httpOnly: true,
    secure: config.nodeEnv === NodeEnv.PRODUCTION,
    sameSite: "strict",
    path: "/",
  });
}
