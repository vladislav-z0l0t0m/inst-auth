import { Schema, model, Document } from "mongoose";
export interface RefreshTokenDocument extends Document {
  userId: number;
  token: string;
  userAgent: string;
  isRevoked: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RefreshTokenSchema = new Schema<RefreshTokenDocument>({
  userId: { type: Number, required: true },
  token: { type: String, required: true },
  userAgent: { type: String, required: true },
  isRevoked: { type: Boolean, required: true, default: false },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
});

RefreshTokenSchema.index({ token: 1 }, { unique: true });
RefreshTokenSchema.index({ userId: 1 });
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
RefreshTokenSchema.index({ isRevoked: 1 });

export const RefreshTokenModel = model<RefreshTokenDocument>(
  "RefreshToken",
  RefreshTokenSchema,
  "refresh_tokens"
);

export type CreateRefreshTokenDto = {
  userId: number;
  token: string;
  ipAddress: string;
  userAgent: string;
  expiresAt: Date;
};

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    username: string;
  };
}
