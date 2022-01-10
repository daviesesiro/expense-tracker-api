import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";

import routes from "../api";
import config from "../config";
import LoggerInstance from "./logger";
import { Container } from "typedi";
import { Logger } from "winston";
import expressJwt from "express-jwt";

export default async ({ app }: { app: Application }) => {
  // Useful if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  // It shows the real origin IP in the heroku or Cloudwatch logs
  app.enable("trust proxy");
  app.use(cors());
  app.use(express.json());
  app.use(
    expressJwt({
      secret: config.jwtSecret,
      algorithms: [config.jwtAlgorithm],
      credentialsRequired: false,
    }),
  );

  require("../jobs/refreshAccounts"); // load cron job

  // Load API routes
  app.use(config.api.prefix, routes());

  // catch 404 and forward to error handler
  app.use((_req, _res, next) => {
    const err = new Error("404 Not Found");
    err["status"] = 404;
    next(err);
  });

  // error handlers
  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const logger = Container.get<Logger>("logger");
    logger.error("Error: %o", err);

    //Handle 401 thrown by express-jwt library
    if (err.name === "UnauthorizedError")
      return res.status(err.status).json({ message: err.message }).end();

    // handle token expired error
    if (err.name === "TokenExpiredError") return res.status(401).end();

    if (err.message === "Validation failed") {
      //Handle validation error from celebrate
      const errDetails =
        err.details.get("params") || err.details.get("query") || err.details.get("body");
      return res.status(400).json({ message: errDetails.details[0].message });
    }

    return next(err);
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.status || 500);
    res.json({
      message: err.message,
    });
  });

  process.on("unhandledRejection", (error, promise) => {
    LoggerInstance.info(" Oh Lord! We forgot to handle a promise rejection here: ", promise);
    LoggerInstance.info(" The error was: ", error);
  });
};
