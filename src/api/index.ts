import { Router } from "express";

import auth from "./routes/auth-routes";
import account from "./routes/account-routes";
import { Logger } from "winston";
import { Container } from "typedi";

// guaranteed to get dependencies
export default () => {
  const app = Router();

  app.use((req, _res, next) => {
    const logger: Logger = Container.get("logger");
    logger.verbose(
      `${new Date().toLocaleString()} - ${req.originalUrl}, body: %o, query: %o, params: %o`,
      req.body,
      req.query,
      req.params,
    );

    next();
  });

  auth(app);
  account(app);

  return app;
};
