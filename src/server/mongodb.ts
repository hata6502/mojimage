import { MongoClient, ServerApiVersion } from "mongodb";

import { getMongoDBURI } from "./env.js";

export const mongoClient = new MongoClient(getMongoDBURI(), {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export const mongoDB = mongoClient.db();
