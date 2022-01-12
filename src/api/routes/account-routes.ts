import { NextFunction, Request, Response, Router } from "express";
import { Container } from "typedi";
import { AccountService } from "../../services/AccountService";
import { authorizeUser } from "../middlewares/authorizeUser";
import { validateLinkAccount } from "../validators/account-validators";

const route = Router();

export default (app: Router) => {
  app.use("/accounts", authorizeUser, route);

  route.post(
    "/link",
    validateLinkAccount(),
    async (req: Request, res: Response, next: NextFunction) => {
      const accountService = Container.get(AccountService);
      try {
        const result = await accountService.link(req.user!, req.body?.token);
        return res.status(201).json(result);
      } catch (err) {
        return next(err);
      }
    },
  );

  route.delete("/:account_id", async (req: Request, res: Response, next: NextFunction) => {
    const accountService = Container.get(AccountService);
    try {
      const result = await accountService.unlink(req.user!, req.params.account_id as string);
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  });

  route.get("/", async (req: Request, res: Response, next: NextFunction) => {
    const accountService = Container.get(AccountService);
    try {
      const result = await accountService.getUserAccounts(req.user!);
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  });

  route.get("/transactions", async (req: Request, res: Response, next: NextFunction) => {
    const accountService = Container.get(AccountService);

    try {
      const result = await accountService.getUserAccountTransactions(req.user!, req.query as any);
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  });

  route.get("/transaction-summary", async (req: Request, res: Response, next: NextFunction) => {
    const accountService = Container.get(AccountService);

    try {
      const result = await accountService.getTransactionSummary(
        req.user!,
        req.query.limit as string,
      );
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  });

  route.get("/summary", async (req: Request, res: Response, next: NextFunction) => {
    const accountService = Container.get(AccountService);
    try {
      const result = await accountService.userAccountSummary(req.user!);
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  });

  route.get("/total-balance", async (req: Request, res: Response, next: NextFunction) => {
    const accountService = Container.get(AccountService);
    try {
      const result = await accountService.totalBalance(req.user!);
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  });
};
