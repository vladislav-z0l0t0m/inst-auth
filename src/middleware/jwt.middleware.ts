import { Request, Response, NextFunction } from "express";
import { JwtService } from "../services/jwt.service";
import { UserApiService } from "../services/user-api.service";

export function createJwtMiddleware(
  jwtService: JwtService,
  userApiService: UserApiService
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next();
      }

      const token = authHeader.substring(7);

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
