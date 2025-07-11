import express from "express";
import session from "express-session";
import passport from "passport";
import mongoose from "mongoose";
import { UserApiService } from "./services/user-api.service";
import { RefreshTokenService } from "./services/refresh-token.service";
import { JwtService } from "./services/jwt.service";
import { OAuthService } from "./services/oauth.service";
import { swaggerMiddleware, swaggerSetup } from "./swagger";
import { createAuthRoutes } from "./routes/auth.routes";
import { createInternalRoutes } from "./routes/internal.routes";
import { createOAuthRoutes } from "./routes/oauth.routes";
import { createAdminRoutes } from "./routes/admin.routes";
import {
  serializeOAuthUser,
  deserializeOAuthUser,
} from "./utils/passport.utils";
import { GoogleStrategy } from "./strategies/google.strategy";
import { FacebookStrategy } from "./strategies/facebook.strategy";
import { createJwtMiddleware } from "./middleware/jwt.middleware";
import { config } from "./config";

export class App {
  public app: express.Application;
  public userApiService: UserApiService;
  public jwtService: JwtService;
  public refreshTokenService!: RefreshTokenService;
  public oauthService!: OAuthService;

  constructor() {
    this.app = express();
    this.userApiService = new UserApiService(config.mainAppUrl);
    this.jwtService = new JwtService();
  }

  async initialize() {
    await this.initializeMongoDB();
    this.setupMiddleware();
    this.setupPassport();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private async initializeMongoDB() {
    try {
      await mongoose.connect(config.mongodbUri);

      this.refreshTokenService = new RefreshTokenService();

      this.oauthService = new OAuthService(
        this.userApiService,
        this.jwtService,
        this.refreshTokenService
      );
    } catch (error) {
      console.error("Failed to initialize MongoDB:", error);
      process.exit(1);
    }
  }

  private setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use("/docs", swaggerMiddleware, swaggerSetup);

    this.app.use(
      session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false },
      })
    );

    this.app.use(passport.initialize());
    this.app.use(passport.session());
    this.app.use(createJwtMiddleware(this.jwtService, this.userApiService));
  }

  private setupPassport() {
    passport.serializeUser((user, done) => {
      const serializedUser = serializeOAuthUser(user);
      if (serializedUser) {
        done(null, serializedUser);
      } else {
        done(new Error("Invalid user object for serialization"), null);
      }
    });

    passport.deserializeUser((sessionData, done) => {
      const deserializedUser = deserializeOAuthUser(sessionData);
      if (deserializedUser) {
        done(null, deserializedUser);
      } else {
        done(new Error("Invalid session data for deserialization"), null);
      }
    });

    GoogleStrategy.initialize();
    FacebookStrategy.initialize();
  }

  private setupRoutes() {
    this.app.get("/health", (req, res) => {
      res.status(200).json({ status: "ok" });
    });

    this.app.use(
      "/",
      createAuthRoutes(
        this.userApiService,
        this.jwtService,
        this.refreshTokenService,
        this.oauthService
      )
    );

    this.app.use("/", createInternalRoutes(this.refreshTokenService));

    this.app.use("/", createOAuthRoutes(this.oauthService));

    if (config.nodeEnv !== "production") {
      this.app.use("/", createAdminRoutes(this.refreshTokenService));
    }
  }

  private setupErrorHandling() {
    this.app.use(
      (
        error: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        console.error("Unhandled error:", error);
        res.status(500).json({
          message: "Internal server error",
          error: config.nodeEnv === "development" ? error.message : undefined,
        });
      }
    );
  }

  public listen(port: number, callback?: () => void) {
    return this.app.listen(port, callback);
  }

  async close() {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}
