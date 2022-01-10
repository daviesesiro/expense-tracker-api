import { NextFunction, Request, Response } from "express";
import { Unauthorized } from "http-errors";

export const authorizeUser = (req: Request, _res: Response, next: NextFunction) => {
  if (req.user) {
    return next();
  }

  throw new Unauthorized();
};
