import { Application } from "express";
import expressLoader from "./express";
import mongooseLoader from "./mongoose";
import Logger from "./logger";
import { Container } from "typedi";
import LoggerInstance from "./logger";

export default async (expressApp: Application): Promise<void> => {
  await mongooseLoader();
  Logger.info("✌️ DB loaded and connected!");

  Container.set("logger", LoggerInstance);

  await expressLoader({ app: expressApp });
  Logger.info("✌️ Express loaded");
};
