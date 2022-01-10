declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    DB_LINK: string;
    JWT_SECRET: string;
    JWT_ALGORITHM: string;
    JWT_EXPIRES_IN: string;
    NODE_ENV: string;
    MONO_PUBLIC_KEY: string;
    MONO_SECRET_KEY: string;
  }
}