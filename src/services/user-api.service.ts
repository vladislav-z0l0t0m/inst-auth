import axios, { AxiosInstance } from "axios";
import { User, AuthenticateRequest, OAuthRequest } from "../types";
import { config } from "../config";

export class UserApiService {
  private baseUrl: string;
  private axiosInstance: AxiosInstance;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async authenticateUser(request: AuthenticateRequest): Promise<User | null> {
    try {
      const response = await this.axiosInstance.post(
        `/internal/auth/authenticate`,
        request,
        {
          headers: {
            "x-internal-api-key": config.internalApiKey,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      if (
        axios.isAxiosError(error) &&
        (error.response?.status === 400 || error.response?.status === 404)
      ) {
        return null;
      }
      throw error;
    }
  }

  async handleOAuthLogin(request: OAuthRequest): Promise<User | null> {
    try {
      const response = await this.axiosInstance.post(
        `/internal/auth/oauth`,
        request,
        {
          headers: {
            "x-internal-api-key": config.internalApiKey,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        return null;
      }
      throw error;
    }
  }

  async getUserById(userId: number): Promise<User | null> {
    try {
      const response = await this.axiosInstance.get(`/user/${userId}`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}
