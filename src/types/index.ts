export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  provider?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthenticateRequest {
  identifier: string;
  identifierType: "email" | "phone" | "username";
  password: string;
}

export interface OAuthRequest {
  email: string;
  provider: "google" | "facebook";
  name?: string;
}

export interface GoogleUserPayload {
  provider: "google";
  email: string;
  name?: string;
  picture?: string;
  accessToken: string;
}

export interface FacebookUserPayload {
  provider: "facebook";
  email: string;
  name?: string;
  picture?: string;
  accessToken: string;
}

export type OAuthUserPayload = GoogleUserPayload | FacebookUserPayload;

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    username: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface JwtPayload {
  userId: number;
}

export interface RefreshTokenPayload {
  userId: number;
  tokenId: string;
}

export interface ExpressUser {
  id: number;
  email: string;
  username: string;
  provider?: string;
}
