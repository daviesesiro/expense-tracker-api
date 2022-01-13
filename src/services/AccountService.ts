import { Inject, Service } from "typedi";
import Account from "../models/Account";
import Transaction from "../models/Transaction";
import { generateObjectId } from "../utils/generateObjectIds";
import { MonoService } from "./MonoService";
import { NotFound } from "http-errors";
import dayjs from "dayjs";
import { ITransaction } from "../interfaces/Transactiont";
import { Logger } from "winston";

@Service()
export class AccountService {
  constructor(private monoService: MonoService, @Inject("logger") private logger: Logger) {}

  async refreshAllAccounts() {
    const accounts = await Account.find();

    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      this.logger.debug("refreshing account: %o", account._id.toString());

      const { code } = await this.monoService.syncAccount(account.accountId);
      if (code === "REAUTHORISATION_REQUIRED") {
        await this.requireReauthorization(account.accountId);
      }
    }
  }

  async userAccountSummary(user: AuthUser) {
    const savings = await Account.countDocuments({ user: user._id, type: { $regex: "SAVINGS" } });
    const current = await Account.countDocuments({ user: user._id, type: { $regex: "CURRENT" } });

    return { savings, current };
  }

  async totalBalance(user: AuthUser) {
    const result = await Account.aggregate([
      { $match: { user: generateObjectId(user._id) } },
      {
        $group: {
          _id: null,
          totalBalance: {
            $sum: "$balance",
          },
        },
      },
      {
        $project: { _id: 0, totalBalance: 1 },
      },
    ]);

    const balance = result.length > 0 ? result[0]?.totalBalance : 0;

    return balance;
  }

  async link(user: AuthUser, token: string) {
    const accountId = await this.monoService.getAccountId(token);
    const accountInfo = await this.monoService.getAccountInfo(accountId);
    let institutionLogo = "";
    // save the instution logo in memory
    if (!bankIconsMap[accountInfo.account.institution.name]) {
      bankIconsMap = await this.monoService.getInstitutionLogos();
    }

    institutionLogo = bankIconsMap[accountInfo.account.institution.name];

    const account = await Account.create({
      name: accountInfo.account.name,
      accountNumber: accountInfo.account.accountNumber,
      accountId: accountInfo.account._id,
      type: accountInfo.account.type,
      balance: accountInfo.account.balance / 100, // convert to naira from kobo
      currency: accountInfo.account.currency,
      institutionName: accountInfo.account.institution.name,
      user: user._id,
      institutionLogo,
    });

    // get transactions
    await this.getUserAccountTransactions(user, { account_id: account._id });

    return account;
  }

  async unlink(user: AuthUser, accountId: string) {
    const account = await Account.findOne({ user: user._id, _id: accountId });

    if (!account) {
      throw new NotFound("Account does not exist");
    }

    await this.monoService.unlinkAccount(account.accountId);

    await Account.deleteOne({ _id: accountId });
    await Transaction.deleteMany({ account: accountId });

    return true;
  }

  async getUserAccounts(user: AuthUser) {
    const accounts = await Account.find({ user: user._id });
    return accounts;
  }

  async getReauthToken(user: AuthUser, id: string) {
    const account = await Account.findOne({ _id: id, user: user._id });

    if (!account) {
      throw new NotFound("Account not found");
    }

    return this.monoService.getReauthToken(account.accountId);
  }

  async getUserAccountTransactions(
    user: AuthUser,
    pagination: {
      account_id?: string;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const accountId = pagination?.account_id;

    const accounts = await Account.find({
      user: generateObjectId(user._id),
      ...(accountId && accountId !== "" && { _id: generateObjectId(accountId) }),
    });

    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];

      if (account.transactionsStale) {
        let newTrns = await this.monoService.getAccountTransactions(account.accountId, {
          ...(account.lastTransactionDate && {
            start: dayjs(account.lastTransactionDate).format("DD-MM-YYYY"),
            end: dayjs().add(1, "day").format("DD-MM-YYYY"),
          }),
        });

        if (account.lastTransactionDate) {
          console.log(newTrns);
          // remove transactions before the last transction date
          newTrns.data = newTrns.data.filter((t: Partial<ITransaction>) =>
            dayjs(t.date).isAfter(account.lastTransactionDate),
          );

          console.log(newTrns);
        }

        // the last transaction is the first in the array
        const lastTransactionDate = newTrns.data.length > 0 ? newTrns.data[0]?.date : null;
        await Account.updateOne(
          { _id: account._id },
          { lastTransactionDate, transactionsStale: false },
        );

        const payload = newTrns.data.map((p: any) => ({
          amount: p.amount / 100, // convert to naira from kobo
          user: user._id,
          account: account._id,
          narration: p.narration,
          type: p.type,
          date: p.date,
        }));

        await Transaction.insertMany(payload);
      }
    }

    const transactions = await Transaction.paginate(
      {
        user: user._id,
        account: { $in: accounts },
      },
      {
        page: pagination.page || 1,
        sort: { date: -1 },
        limit: pagination.limit || 10,
        lean: true,
      },
    );

    return transactions;
  }

  async getTransactionSummary(user: AuthUser, limit?: string) {
    const result = await Transaction.aggregate([
      { $match: { user: generateObjectId(user._id) } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: parseInt(limit || "30") },
      { $project: { date: "$_id", amount: 1, _id: 0 } },
    ]);

    return result;
  }

  // webhooks methods
  async requireReauthorization(accountId: string) {
    await Account.updateOne({ accountId }, { dataAvailable: false, reAuthorize: true });
  }

  async completeReauthorization(accountId: string) {
    await Account.updateOne({ accountId }, { reAuthorize: false });
  }

  async updateAccount(accountId: string, account: LooseObject) {
    await Account.updateOne(
      { accountId },
      { dataAvailable: true, transactionsStale: true, balance: Number(account.balance) / 100 },
    );
  }
}

let bankIconsMap: LooseObject = {};
