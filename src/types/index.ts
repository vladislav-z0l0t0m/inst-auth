// User interface
export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  provider?: string;
  createdAt: string;
  updatedAt: string;
}

// Authentication request
export interface AuthenticateRequest {
  identifier: string;
  identifierType: "email" | "phone" | "username";
  password: string;
}

// OAuth request
export interface OAuthRequest {
  email: string;
  provider: "google" | "facebook";
  name?: string;
}

// OAuth user payload union type
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

// Login response
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

// Express user interface for passport
export interface ExpressUser {
  id: number;
  email: string;
  username: string;
  provider?: string;
}
