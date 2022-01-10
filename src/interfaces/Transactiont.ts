import { Document } from "mongoose";

export interface ITransaction extends Document {
  _id: string;
  type: string;
  amount: number;
  narration: string;
  account: string;
  user: string;
  date: string;
}
