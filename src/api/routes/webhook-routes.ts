import { Router, Request, Response, NextFunction } from "express";
import { Container } from "typedi";
import config from "../../config";
import { AccountService } from "../../services/AccountService";

const route = Router();

export default (app: Router) => {
  app.use("/webhook", route);

  route.post("/mono", async (req: Request, res: Response, next: NextFunction) => {
    if (req.headers["mono-webhook-secret"] !== config.mono.webhookSecret && !config.isDev) {
      // invalid webhook request
      return res.sendStatus(200);
    }

    const accountService = Container.get(AccountService);

    const { event, data } = req.body;
    switch (event) {
      case "mono.events.reauthorisation_required":
        accountService.requireReauthorization(data.account._id);
        break;
      case "mono.events.account_connected":
        // nothing to do here
        break;
      case "mono.events.account_reauthorized":
        accountService.completeReauthorization(data.account._id);
        break;
      case "mono.events.account_updated":
        if (data.meta.data_status === "AVAILABLE") {
          accountService.updateAccount(data.account._id, data.account);
        }
        break;
      default:
        break;
    }
    // const accountService = Container.get(MonoService);
    try {
      //   const result = await accountService.link(req.user!, req.body?.token);
      return res.sendStatus(200);
    } catch (err) {
      return next(err);
    }
  });
};
