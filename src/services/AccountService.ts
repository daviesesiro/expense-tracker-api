import { Service } from "typedi";
import Account from "../models/Account";
import Transaction from "../models/Transaction";
import { generateObjectId } from "../utils/generateObjectIds";
import { MonoService } from "./MonoService";
import { NotFound } from "http-errors";

@Service()
export class AccountService {
  constructor(private monoService: MonoService) {}

  async refreshAllAccounts() {
    const accounts = await Account.find();

    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];

      await this.monoService.syncAccount(account.accountId);
    }
  }

  async userAccountSummary(user: AuthUser) {
    const savings = await Account.countDocuments({ user: user._id, type: "savings_account" });
    const current = await Account.countDocuments({ user: user._id, type: "current_account" });

    return { savings, current };
  }

  async totalBalance(user: AuthUser) {
    const result = await Account.aggregate([
      { $match: { user: generateObjectId(user._id) } },
      {
        $addFields: {
          convertedBalance: { $toDecimal: "$balance" },
        },
      },
      {
        $group: {
          _id: null,
          totalBalance: {
            $sum: "$convertedBalance",
          },
        },
      },
      {
        $project: { _id: 0, totalBalance: { $toString: "$totalBalance" } },
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
      balance: accountInfo.account.balance,
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

  async getUserAccountTransactions(
    user: AuthUser,
    pagination: {
      account_id?: string;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const accountId = pagination?.account_id;

    const account = await Account.findOne({
      user: generateObjectId(user._id),
      ...(accountId && accountId !== "" && { _id: generateObjectId(accountId) }),
    });

    if (!account) {
      throw new NotFound("Account does not exist");
    }

    if (accountId) {
      const accountTransaction = await Transaction.findOne({ account: account._id });

      if (!accountTransaction) {
        const newTransactions = await this.monoService.getAccountTransactions(account.accountId, {
          paginate: "false",
        });

        const payload = newTransactions.data.map((p: any) => ({
          ...p,
          user: user._id,
          account: accountId,
        }));

        await Transaction.insertMany(payload);
      }
    }

    const transactions = await Transaction.paginate(
      {
        user: user._id,
        ...(accountId && accountId !== "" ? { account: accountId } : {}),
      },
      {
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        lean: true,
      },
    );

    return transactions;
  }

  async getTransactionSummary(user: AuthUser, limit?: string) {
    const result = await Transaction.aggregate([
      {
        $match: {
          user: generateObjectId(user._id),
        },
      },
      {
        $addFields: {
          convertedAmount: { $divide: [{ $toDecimal: "$amount" }, 100] },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          amount: { $sum: "$convertedAmount" },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: parseInt(limit || "30") },
      { $project: { date: "$_id", amount: { $toString: "$amount" }, _id: 0 } },
    ]);

    return result;
  }
}

let bankIconsMap: LooseObject = {};
