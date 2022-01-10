import mongoose, { Schema, Document } from "mongoose";
import { IAccount } from "../interfaces/Account";

const Account = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    balance: { type: String, required: true },
    accountId: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    accountNumber: String,
    institutionName: String,
    bvn: String,
    currency: String,
    institutionLogo: String,

    reAuthorize: { type: Boolean },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.model<IAccount & Document>("Account", Account);
