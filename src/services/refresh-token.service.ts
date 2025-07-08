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
      isRevoked: false,
      expiresAt: data.expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await token.save();
  }

  async findByToken(token: string): Promise<RefreshTokenDocument | null> {
    return await RefreshTokenModel.findOne({
      token,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });
  }

  async findByUserId(userId: number): Promise<RefreshTokenDocument[]> {
    return await RefreshTokenModel.find({
      userId,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });
  }

  async revokeToken(token: string): Promise<boolean> {
    const result = await RefreshTokenModel.updateOne(
      { token },
      {
        $set: {
          isRevoked: true,
          updatedAt: new Date(),
        },
      }
    );
    return result.modifiedCount > 0;
  }

  async revokeAllUserTokens(userId: number): Promise<number> {
    const result = await RefreshTokenModel.updateMany(
      { userId, isRevoked: false },
      {
        $set: {
          isRevoked: true,
          updatedAt: new Date(),
        },
      }
    );
    return result.modifiedCount;
  }

  async cleanupExpiredTokens(): Promise<number> {
    const result = await RefreshTokenModel.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    return result.deletedCount;
  }

  async cleanupRevokedTokens(): Promise<number> {
    const result = await RefreshTokenModel.deleteMany({
      isRevoked: true,
    });
    return result.deletedCount;
  }

  generateRefreshToken(): string {
    return crypto.randomBytes(64).toString("hex");
  }
}
