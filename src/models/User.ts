import mongoose, { Schema, Document } from "mongoose";

import { IUser } from "../interfaces/User";

const User = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.model<IUser & Document>("User", User);
