import express from "express";
import session from "express-session";
import passport from "passport";
import { MongoClient } from "mongodb";
import { UserApiService } from "./services/user-api.service";
import { RefreshTokenService } from "./services/refresh-token.service";
import { JwtService } from "./services/jwt.service";
import { OAuthService } from "./services/oauth.service";
import { swaggerMiddleware, swaggerSetup } from "./swagger";
import { createAuthRoutes } from "./routes/auth.routes";
import { createOAuthRoutes } from "./routes/oauth.routes";
import {
  serializeOAuthUser,
  deserializeOAuthUser,
} from "./utils/passport.utils";
import { GoogleStrategy } from "./strategies/google.strategy";
import { FacebookStrategy } from "./strategies/facebook.strategy";
import { config } from "./config";

export class App {
  public app: express.Application;
  public mongoClient!: MongoClient;
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
      this.mongoClient = new MongoClient(config.mongodbUri);
      await this.mongoClient.connect();

      this.refreshTokenService = new RefreshTokenService(this.mongoClient);
      await this.refreshTokenService.initializeIndexes();

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

    // Swagger documentation
    this.app.use("/docs", swaggerMiddleware, swaggerSetup);

    // Session middleware
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
  }

  private setupPassport() {
    // Type-safe passport serialization
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

    // Initialize OAuth strategies
    GoogleStrategy.initialize();
    FacebookStrategy.initialize();
  }

  private setupRoutes() {
    // Health check
    this.app.get("/health", (req, res) => {
      res.status(200).json({ status: "ok" });
    });

    // Auth routes
    this.app.use(
      "/",
      createAuthRoutes(
        this.userApiService,
        this.jwtService,
        this.refreshTokenService,
        this.oauthService
      )
    );

    // OAuth routes
    this.app.use("/", createOAuthRoutes(this.oauthService));
  }

  private setupErrorHandling() {
    // Error handling middleware
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

  async close() {
    if (this.mongoClient) {
      await this.mongoClient.close();
    }
  }
}
