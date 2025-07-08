import {
  RefreshTokenModel,
  RefreshTokenDocument,
  CreateRefreshTokenDto,
} from "../models/refresh-token.model";
import crypto from "crypto";

export class RefreshTokenService {
  async createToken(
    data: CreateRefreshTokenDto
  ): Promise<RefreshTokenDocument> {
    const token = new RefreshTokenModel({
      userId: data.userId,
      token: data.token,
      userAgent: data.userAgent,
      expiresAt: data.expiresAt,
      createdAt: new Date(),
    });

    return await token.save();
  }

  async findByToken(token: string): Promise<RefreshTokenDocument | null> {
    return await RefreshTokenModel.findOne({
      token,
      expiresAt: { $gt: new Date() },
    });
  }

  async revokeToken(token: string): Promise<boolean> {
    const result = await RefreshTokenModel.updateOne(
      { token },
      {
        $set: {
          expiresAt: new Date(),
        },
      }
    );
    return result.modifiedCount > 0;
  }

  async revokeAllUserTokens(userId: number): Promise<number> {
    const result = await RefreshTokenModel.updateMany(
      { userId, expiresAt: { $gt: new Date() } },
      {
        $set: {
          expiresAt: new Date(),
        },
      }
    );
    return result.modifiedCount;
  }

  async revokeAllTokens(): Promise<number> {
    const result = await RefreshTokenModel.updateMany(
      { expiresAt: { $gt: new Date() } },
      {
        $set: {
          expiresAt: new Date(),
        },
      }
    );
    return result.modifiedCount;
  }

  generateRefreshToken(): string {
    return crypto.randomBytes(64).toString("hex");
  }
}
