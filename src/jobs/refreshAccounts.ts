import cron from "node-cron";
import { AccountService } from "../services/AccountService";
import { Container } from "typedi";

const accountService = Container.get(AccountService);

// This feature is not yet activated
cron.schedule("0 */3 * * *", async () => {
  await accountService.refreshAllAccounts();
});
