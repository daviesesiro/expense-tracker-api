import { Service } from "typedi";
import { hash, compareSync } from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config";
import User from "../models/User";
import { BadRequest, Unauthorized } from "http-errors";
import { registerUserDto } from "../interfaces/User";
import Account from "../models/Account";
import { MonoService } from "./MonoService";
import Transaction from "../models/Transaction";
import { generateObjectIds } from "../utils/generateObjectIds";

@Service()
export class AuthService {
  constructor(private monoService: MonoService) {}

  async login(email: string, password: string) {
    const user = await User.findOne({ email }).lean();

    if (!user) {
      throw new Unauthorized("Invalid credentials");
    }

    if (!compareSync(password, user.password!)) {
      throw new Unauthorized("Invalid credentails");
    }

    user.password = undefined; // hide password
    const accounts = await Account.count({ user: user._id });

    return { user: { ...user, accounts }, token: this.generateJwtToken(user) };
  }

  async register(payload: registerUserDto) {
    let user = await User.findOne({ email: payload.email });

    if (user) {
      throw new BadRequest("Email already taken");
    }

    payload.password = await hash(payload.password, 10);
    user = await User.create(payload);

    user.password = undefined; // hide password

    return {
      user: { ...user.toObject(), accounts: 0 },
      token: this.generateJwtToken(user),
    };
  }

  async deleteUser(user: AuthUser) {
    await User.deleteOne({ _id: user._id });
    const userAccounts = await Account.find({ user: user._id });
    await Account.deleteMany({ user: user._id });

    const userAccountMonoIds = userAccounts.map((a) => a.accountId);
    const userAccountIds = userAccounts.map((a) => a._id);

    for (let i = 0; i < userAccountMonoIds.length; i++) {
      const id = userAccountMonoIds[i];
      await this.monoService.unlinkAccount(id);
    }

    await Transaction.deleteMany({
      user: user._id,
      account: { $in: generateObjectIds(userAccountIds) },
    });

    return true;
  }

  async getCurrentUser(id: string) {
    const user = await User.findOne({ _id: id }).lean();

    if (user) {
      const accounts = await Account.countDocuments({ user: id });

      user.password = undefined; // hide
      return { ...user, accounts };
    }

    throw new Unauthorized();
  }

  generateJwtToken(payload: JwtPayload) {
    return jwt.sign({ email: payload.email, _id: payload._id }, config.jwtSecret, {
      algorithm: config.jwtAlgorithm as jwt.Algorithm,
      expiresIn: config.jwtExpiresIn,
    });
  }
}
