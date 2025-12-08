import { Request, Response, NextFunction } from "express";
import { JwtService } from "../services/jwt.service";
import { UserApiService } from "../services/user-api.service";
import { COOKIE_NAMES } from "../utils/cookie.utils";

export function createJwtMiddleware(
  jwtService: JwtService,
  userApiService: UserApiService
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let token: string | undefined;

      token = req.cookies?.[COOKIE_NAMES.ACCESS_TOKEN];

      if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
          token = authHeader.substring(7);
        }
      }

      if (!token) {
        return next();
      }

      const payload = jwtService.verifyAccessToken(token);

      const user = await userApiService.getUserById(payload.userId);

      if (!user) {
        return next();
      }

      req.user = user;

      next();
    } catch (error) {
      next();
    }
  };
}
