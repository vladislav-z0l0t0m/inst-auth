import jwt, { JwtPayload as JwtPayloadType } from "jsonwebtoken";
import { JwtPayload, RefreshTokenPayload } from "../types";
import { config } from "../config";

export class JwtService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiresIn: string;
  private readonly refreshTokenExpiresIn: string;

  constructor() {
    this.accessTokenSecret = config.jwtSecret;
    this.refreshTokenSecret = config.jwtRefreshSecret;
    this.accessTokenExpiresIn = config.jwtExpiresIn;
    this.refreshTokenExpiresIn = config.jwtRefreshExpiresIn;
  }

  generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiresIn as any,
    });
  }

  generateRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiresIn as any,
    });
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.accessTokenSecret) as JwtPayload;
    } catch (error) {
      throw new Error("Invalid access token");
    }
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      return jwt.verify(token, this.refreshTokenSecret) as RefreshTokenPayload;
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }

  decodeToken(token: string): JwtPayloadType | null {
    try {
      const decoded = jwt.decode(token);
      return typeof decoded === "object" ? decoded : null;
    } catch (error) {
      return null;
    }
  }
}
