import { Request } from "express";
import { ExpressUser } from "../types";

export function getAuthenticatedUser(req: Request): ExpressUser | null {
  if (req.user !== undefined && req.user !== null) {
    return req.user as ExpressUser;
  }
  return null;
}

export function getClientIP(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

export function getUserAgent(req: Request): string {
  return req.get("User-Agent") || "unknown";
}
