import { UserApiService } from "./user-api.service";
import { JwtService } from "./jwt.service";
import { RefreshTokenService } from "./refresh-token.service";
import { OAuthUserPayload, LoginResponse } from "../types";
import { REFRESH_TOKEN_EXPIRES_IN_MS } from "../constants/time";

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
    const user = await this.userApiService.handleOAuthLogin(oauthPayload);

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
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS),
    });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }
}
