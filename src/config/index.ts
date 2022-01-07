import dotenv from "dotenv";

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || "development";

dotenv.config();

export default {
  port: parseInt(process.env.PORT!),

  databaseURL:
    process.env.NODE_ENV === "development"
      ? "mongodb://localhost:27017/mono-app"
      : (process.env.DB_LINK as string),

  /**
   * Your secret sauce
   */
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

  /**
   * Frontend Endpoint (Susceptible to change, hence reason why the strings are put directly here)
   */
  frontendBaseurl:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://bloom-medic.herokuapp.com",
};
