import { UserApiService } from "./user-api.service";
import { JwtService } from "./jwt.service";
import { RefreshTokenService } from "./refresh-token.service";
import { OAuthUserPayload, LoginResponse } from "../types";

export class OAuthService {
  constructor(
    private userApiService: UserApiService,
    private jwtService: JwtService,
    private refreshTokenService: RefreshTokenService
  ) {}

  async handleOAuthLogin(
    oauthPayload: OAuthUserPayload,
    ipAddress: string,
    userAgent: string
  ): Promise<LoginResponse> {
    const user = await this.userApiService.handleOAuthLogin({
      email: oauthPayload.email,
      provider: oauthPayload.provider,
      name: oauthPayload.name,
    });

    if (!user) {
      throw new Error("Failed to process OAuth login");
    }

    const accessToken = this.jwtService.generateAccessToken({
      userId: user.id,
    });

    const refreshTokenValue = this.refreshTokenService.generateRefreshToken();
    const refreshToken = this.jwtService.generateRefreshToken({
      userId: user.id,
      tokenId: refreshTokenValue,
    });

    await this.refreshTokenService.createToken({
      userId: user.id,
      token: refreshTokenValue,
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }
}
