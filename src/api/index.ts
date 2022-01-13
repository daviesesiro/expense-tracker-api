import { Router } from "express";
import { Container } from "typedi";
import { Logger } from "winston";
import account from "./routes/account-routes";
import auth from "./routes/auth-routes";
import webhook from "./routes/webhook-routes";

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
  webhook(app);

  return app;
};
