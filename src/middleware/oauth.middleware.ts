import { Request, Response, NextFunction } from "express";
import { OAuthUserPayload } from "../types";
import { isOAuthUserPayload } from "../utils/passport.utils";

// Middleware для проверки OAuth аутентификации
export function requireOAuthUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ message: "OAuth authentication required" });
  }

  if (!isOAuthUserPayload(req.user)) {
    return res.status(401).json({ message: "Invalid OAuth user data" });
  }

  next();
}

// Типизированный middleware для обработки OAuth запросов
export function withOAuthUser<T>(
  handler: (req: Request, res: Response, user: OAuthUserPayload) => Promise<T>
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json({ message: "OAuth authentication required" });
      }

      if (!isOAuthUserPayload(req.user)) {
        return res.status(401).json({ message: "Invalid OAuth user data" });
      }

      await handler(req, res, req.user);
    } catch (error) {
      next(error);
    }
  };
}
