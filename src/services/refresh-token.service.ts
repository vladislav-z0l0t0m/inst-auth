import { MongoClient, Db, Collection } from "mongodb";
import {
  RefreshToken,
  CreateRefreshTokenDto,
} from "../models/refresh-token.model";
import crypto from "crypto";

export class RefreshTokenService {
  private db: Db;
  private collection: Collection<RefreshToken>;

  constructor(mongoClient: MongoClient) {
    this.db = mongoClient.db("auth_service");
    this.collection = this.db.collection<RefreshToken>("refresh_tokens");
  }

  async createToken(data: CreateRefreshTokenDto): Promise<RefreshToken> {
    const token: RefreshToken = {
      userId: data.userId,
      token: data.token,
      userAgent: data.userAgent,
      isRevoked: false,
      expiresAt: data.expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.collection.insertOne(token);
    return { ...token, _id: result.insertedId.toString() };
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return await this.collection.findOne({
      token,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });
  }

  async findByUserId(userId: number): Promise<RefreshToken[]> {
    return await this.collection
      .find({
        userId,
        isRevoked: false,
        expiresAt: { $gt: new Date() },
      })
      .toArray();
  }

  async revokeToken(token: string): Promise<boolean> {
    const result = await this.collection.updateOne(
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
    const result = await this.collection.updateMany(
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
    const result = await this.collection.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    return result.deletedCount;
  }

  generateRefreshToken(): string {
    return crypto.randomBytes(64).toString("hex");
  }

  async initializeIndexes(): Promise<void> {
    await this.collection.createIndex({ token: 1 }, { unique: true });
    await this.collection.createIndex({ userId: 1 });
    await this.collection.createIndex({ expiresAt: 1 });
    await this.collection.createIndex({ isRevoked: 1 });
  }
}
