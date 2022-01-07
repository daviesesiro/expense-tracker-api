import { Application } from "express";

/* eslint-disable @typescript-eslint/no-var-requires */
import expressLoader from "./express";
import dependencyInjectorLoader from "./dependencyInjector";
import mongooseLoader from "./mongoose";
import Logger from "./logger";

export default async ({ expressApp }: { expressApp: Application }): Promise<void> => {
  await mongooseLoader();
  Logger.info("✌️ DB loaded and connected!");

  // ? Removed models from container
  await dependencyInjectorLoader();
  // Logger.info("✌️ Dependency Injector loaded");

  await expressLoader({ app: expressApp });
  Logger.info("✌️ Express loaded");
};
