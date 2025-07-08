import swaggerUi from "swagger-ui-express";

export const swaggerMiddleware = swaggerUi.serve;

export const swaggerSetup = swaggerUi.setup({
  openapi: "3.0.0",
  info: {
    title: "Auth Service API",
    version: "1.0.0",
    description: "Authentication service for Instagram clone",
  },
  servers: [
    {
      url: "http://localhost/auth",
      description: "Development server",
    },
  ],
  paths: {
    "/login": {
      post: {
        summary: "User login",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["identifier", "identifierType", "password"],
                properties: {
                  identifier: {
                    type: "string",
                    description: "User identifier (email, phone, or username)",
                  },
                  identifierType: {
                    type: "string",
                    enum: ["email", "phone", "username"],
                    description: "Type of identifier",
                  },
                  password: {
                    type: "string",
                    description: "User password",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    accessToken: {
                      type: "string",
                      description: "JWT access token",
                    },
                    refreshToken: {
                      type: "string",
                      description: "JWT refresh token",
                    },
                    user: {
                      type: "object",
                      properties: {
                        id: { type: "number" },
                        email: { type: "string" },
                        username: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Invalid credentials",
          },
          500: {
            description: "Internal server error",
          },
        },
      },
    },
    "/google": {
      get: {
        summary: "Google OAuth login",
        tags: ["OAuth"],
        description: "Redirects to Google OAuth for authentication",
        responses: {
          302: {
            description: "Redirect to Google OAuth",
          },
        },
      },
    },
    "/google/callback": {
      get: {
        summary: "Google OAuth callback",
        tags: ["OAuth"],
        description: "Handles Google OAuth callback and returns tokens",
        responses: {
          302: {
            description: "Redirect to frontend with tokens",
          },
        },
      },
    },
    "/facebook": {
      get: {
        summary: "Facebook OAuth login",
        tags: ["OAuth"],
        description: "Redirects to Facebook OAuth for authentication",
        responses: {
          302: {
            description: "Redirect to Facebook OAuth",
          },
        },
      },
    },
    "/facebook/callback": {
      get: {
        summary: "Facebook OAuth callback",
        tags: ["OAuth"],
        description: "Handles Facebook OAuth callback and returns tokens",
        responses: {
          302: {
            description: "Redirect to frontend with tokens",
          },
        },
      },
    },
    "/refresh": {
      post: {
        summary: "Refresh access token",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["refreshToken"],
                properties: {
                  refreshToken: {
                    type: "string",
                    description: "Refresh token",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Token refreshed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    accessToken: {
                      type: "string",
                      description: "New JWT access token",
                    },
                    refreshToken: {
                      type: "string",
                      description: "New JWT refresh token",
                    },
                    user: {
                      type: "object",
                      properties: {
                        id: { type: "number" },
                        email: { type: "string" },
                        username: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Invalid refresh token",
          },
        },
      },
    },
    "/logout": {
      post: {
        summary: "User logout",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["refreshToken"],
                properties: {
                  refreshToken: {
                    type: "string",
                    description: "Refresh token to revoke",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Logged out successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Logged out successfully",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid refresh token",
          },
        },
      },
    },
    "/admin/tokens": {
      delete: {
        summary: "Revoke all tokens for all users (Admin only)",
        tags: ["Admin"],
        description:
          "Available only in non-production environments. Requires Bearer token authentication.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "All tokens revoked successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Successfully revoked 150 tokens for all users",
                      description:
                        "Success message or 'No active tokens found for any user' if no tokens were revoked",
                    },
                    revokedCount: {
                      type: "number",
                      example: 150,
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Internal server error",
          },
        },
      },
    },
    "/admin/tokens/{userId}": {
      delete: {
        summary: "Revoke all tokens for specific user (Admin only)",
        tags: ["Admin"],
        description:
          "Available only in non-production environments. Requires Bearer token authentication.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            description: "User ID",
          },
        ],
        responses: {
          200: {
            description: "User tokens revoked successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Successfully revoked 5 tokens for user 123",
                      description:
                        "Success message or 'No active tokens found for user {userId}' if no tokens were revoked",
                    },
                    revokedCount: {
                      type: "number",
                      example: 5,
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid userId parameter",
          },
          500: {
            description: "Internal server error",
          },
        },
      },
    },
    "/oauth": {
      post: {
        summary: "Manual OAuth login",
        tags: ["OAuth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "provider"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    description: "User email",
                  },
                  provider: {
                    type: "string",
                    enum: ["google", "facebook"],
                    description: "OAuth provider",
                  },
                  name: {
                    type: "string",
                    description: "User name (optional)",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "OAuth login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    accessToken: {
                      type: "string",
                      description: "JWT access token",
                    },
                    refreshToken: {
                      type: "string",
                      description: "JWT refresh token",
                    },
                    user: {
                      type: "object",
                      properties: {
                        id: { type: "number" },
                        email: { type: "string" },
                        username: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid OAuth data",
          },
          500: {
            description: "Internal server error",
          },
        },
      },
    },
    "/health": {
      get: {
        summary: "Health check",
        tags: ["System"],
        responses: {
          200: {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "ok",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
});
