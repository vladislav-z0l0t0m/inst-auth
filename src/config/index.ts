interface Config {
  // Server
  port: number;
  nodeEnv: string;

  // Database
  mongodbUri: string;

  // JWT
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;

  // Session
  sessionSecret: string;

  // External services
  mainAppUrl: string;

  // OAuth - Google
  googleClientId: string;
  googleClientSecret: string;
  googleCallbackUrl: string;

  // OAuth - Facebook
  facebookAppId: string;
  facebookAppSecret: string;
  facebookCallbackUrl: string;
}

function validateConfig(): Config {
  const requiredEnvVars = [
    "AUTH_PORT",
    "MONGODB_URI",
    "JWT_SECRET",
    "JWT_REFRESH_SECRET",
    "JWT_EXPIRES_IN",
    "JWT_REFRESH_EXPIRES_IN",
    "SESSION_SECRET",
    "MAIN_APP_URL",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_CALLBACK_URL",
    "FACEBOOK_APP_ID",
    "FACEBOOK_APP_SECRET",
    "FACEBOOK_CALLBACK_URL",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }

  return {
    // Server
    port: parseInt(process.env.AUTH_PORT!, 10),
    nodeEnv: process.env.NODE_ENV || "development",

    // Database
    mongodbUri: process.env.MONGODB_URI!,

    // JWT
    jwtSecret: process.env.JWT_SECRET!,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN!,
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN!,

    // Session
    sessionSecret: process.env.SESSION_SECRET!,

    // External services
    mainAppUrl: process.env.MAIN_APP_URL!,

    // OAuth - Google
    googleClientId: process.env.GOOGLE_CLIENT_ID!,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL!,

    // OAuth - Facebook
    facebookAppId: process.env.FACEBOOK_APP_ID!,
    facebookAppSecret: process.env.FACEBOOK_APP_SECRET!,
    facebookCallbackUrl: process.env.FACEBOOK_CALLBACK_URL!,
  };
}

export const config = validateConfig();
