import cron from "node-cron";
import { AccountService } from "../services/AccountService";
import { Container } from "typedi";
import { Logger } from "winston";

const accountService = Container.get(AccountService);
const logger: Logger = Container.get("logger");

cron.schedule("0 */3 * * *", async () => {
  logger.debug("Account refresh job has been triggered: %o", new Date());
  accountService.refreshAllAccounts();
});
