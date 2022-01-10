import mongoose from "mongoose";
import { Db } from "mongodb";

import config from "../config";

export default async (): Promise<Db> => {
  // mongodb connection option
  const options = {
    useNewUrlParser: true,
    autoIndex: true,
    useUnifiedTopology: true,
  };

  //create the connections
  const connection = await mongoose.connect(config.databaseURL, options);

  return connection.connection.db;
};
