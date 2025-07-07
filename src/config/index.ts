import { z } from "zod";

const configSchema = z.object({
  // Server
  port: z.coerce.number().min(1).max(65535),
  nodeEnv: z.enum(["development", "production", "test"]),

  // Database
  mongodbUri: z.string().url("Invalid MongoDB URI"),

  // JWT
  jwtSecret: z.string(),
  jwtRefreshSecret: z.string(),
  jwtExpiresIn: z.string(),
  jwtRefreshExpiresIn: z.string(),

  // Session
  sessionSecret: z.string(),

  // External services
  mainAppUrl: z.string().url("Invalid main app URL"),

  // OAuth - Google
  googleClientId: z.string(),
  googleClientSecret: z.string(),
  googleCallbackUrl: z.string().url("Invalid Google callback URL"),

  // OAuth - Facebook
  facebookAppId: z.string(),
  facebookAppSecret: z.string(),
  facebookCallbackUrl: z.string().url("Invalid Facebook callback URL"),
});

type Config = z.infer<typeof configSchema>;

function validateConfig(): Config {
  const result = configSchema.safeParse({
    port: process.env.AUTH_PORT,
    nodeEnv: process.env.NODE_ENV,
    mongodbUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN,
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    sessionSecret: process.env.SESSION_SECRET,
    mainAppUrl: process.env.MAIN_APP_URL,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL,
    facebookAppId: process.env.FACEBOOK_APP_ID,
    facebookAppSecret: process.env.FACEBOOK_APP_SECRET,
    facebookCallbackUrl: process.env.FACEBOOK_CALLBACK_URL,
  });

  if (!result.success) {
    const errorDetails = result.error.errors
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join("\n");
    throw new Error(`Configuration validation failed:\n${errorDetails}`);
  }

  return result.data;
}

export const config = validateConfig();
