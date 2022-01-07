import mongoose from "mongoose";

export const generateObjectIds = (ids: string[] = []) =>
  ids.map((id) => new mongoose.Types.ObjectId(id));

export const generateObjectId = (id: string) => new mongoose.Types.ObjectId(id);
