import mongoose, { Schema, Document } from "mongoose";
import { IAccount } from "../interfaces/Account";

const Account = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    balance: { type: Number, required: true },
    accountId: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    accountNumber: String,
    institutionName: String,
    bvn: String,
    currency: String,
    institutionLogo: String,

    lastTransactionDate: Date,
    transactionsStale: { type: Boolean, default: true },

    reAuthorize: { default: false, type: Boolean },
    dataAvailable: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.model<IAccount & Document>("Account", Account);
