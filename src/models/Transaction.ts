import mongoose, { Schema, Document, PaginateModel } from "mongoose";
import { ITransaction } from "../interfaces/Transactiont";
import mongoosePaginate from "mongoose-paginate-v2";

const Transaction = new Schema(
  {
    account: { index: true, type: Schema.Types.ObjectId, ref: "Account", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: String,
    amount: Number,
    narration: String,
    naration: String,
    date: Date,
  },
  { timestamps: true, versionKey: false },
);

Transaction.plugin(mongoosePaginate);

interface TransactionModel<T extends Document> extends PaginateModel<T> {}

export default mongoose.model<ITransaction>(
  "Transaction",
  Transaction,
) as TransactionModel<ITransaction>;
