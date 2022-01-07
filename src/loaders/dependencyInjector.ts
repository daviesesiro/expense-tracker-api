import { Container } from "typedi";

import LoggerInstance from "./logger";

export default async () => {
  try {
    // models.forEach((m) => {
    //   Container.set(m.name, m.model);
    // });
    LoggerInstance.info("✌️ Models into container");

    Container.set("logger", LoggerInstance);
  } catch (e) {
    LoggerInstance.error("🔥 Error on dependency injector loader: %o", e);
    throw e;
  }
};
