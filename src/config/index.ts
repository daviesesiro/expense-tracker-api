import dotenv from "dotenv";

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || "development";

dotenv.config();

export default {
  port: parseInt(process.env.PORT!),

  isDev: process.env.NODE_ENV,

  databaseURL:
    process.env.NODE_ENV === "development"
      ? "mongodb://localhost:27017/mono-app"
      : (process.env.DB_LINK as string),

  jwtSecret: process.env.JWT_SECRET!,
  jwtAlgorithm: process.env.JWT_ALGORITHM!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN!,

  /**
   * Used by winston logger
   */
  logs: {
    level: process.env.LOG_LEVEL || "silly",
  },

  api: {
    prefix: "/",
  },

  mono: {
    secretKey: process.env.MONO_SECRET_KEY,
    publicKey: process.env.MONO_PUBLIC_KEY,
    webhookSecret: process.env.MONO_WEBHOOK_SECRET,
  },

  frontendBaseurl: process.env.NODE_ENV === "development" ? "http://localhost:3000" : "",
};
