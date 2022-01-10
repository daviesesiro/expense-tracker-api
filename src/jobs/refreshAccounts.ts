import cron from "node-cron";
// import { AccountService } from "../services/AccountService";
// import { Container } from "typedi";

// const accountService = Container.get(AccountService);

// This manual data-sync is not yet activated on my account
cron.schedule("0 */3 * * *", async () => {
  // await accountService.refreshAllAccounts();
});
