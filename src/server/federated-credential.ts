import { ObjectId } from "mongodb";

import { mongoDB } from "./mongodb.js";

export const federatedCredentialCollection = mongoDB.collection<{
  provider: string;
  subject: string;
  userID: ObjectId;
}>("federated_credentials");
