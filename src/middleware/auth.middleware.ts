import { Request, Response, NextFunction } from "express";
import { getAuthenticatedUser } from "../utils/request.utils";
import { OAuthUserPayload } from "../types";

// Middleware для проверки аутентификации
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

// Типизированный middleware для обработки аутентифицированных запросов
export function withAuthenticatedUser<T>(
  handler: (req: Request, res: Response, user: OAuthUserPayload) => Promise<T>
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = getAuthenticatedUser(req);
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      await handler(req, res, user);
    } catch (error) {
      next(error);
    }
  };
}
