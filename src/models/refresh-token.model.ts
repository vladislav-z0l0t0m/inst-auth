export interface RefreshToken {
  _id?: string;
  userId: number;
  token: string;
  userAgent: string;
  isRevoked: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRefreshTokenDto {
  userId: number;
  token: string;
  ipAddress: string;
  userAgent: string;
  expiresAt: Date;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    username: string;
  };
}
