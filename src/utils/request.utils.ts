import { Request } from "express";
import { ExpressUser } from "../types";

// Безопасное извлечение пользователя из запроса
export function getAuthenticatedUser(req: Request): ExpressUser | null {
  if (req.user !== undefined && req.user !== null) {
    return req.user as ExpressUser;
  }
  return null;
}

// Helper function to get client IP
export function getClientIP(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

// Helper function to get user agent
export function getUserAgent(req: Request): string {
  return req.get("User-Agent") || "unknown";
}
