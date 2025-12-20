import MongoStore from "connect-mongo";
import expressSession from "express-session";

import { getMongoDBURI, getNodeEnv, getSessionSecret } from "./env.js";

export const session = expressSession({
  secret: getSessionSecret(),
  name: "mojimage",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: {
      development: false,
      production: true,
    }[getNodeEnv()],
  },
  store: MongoStore.create({ mongoUrl: getMongoDBURI() }),
});
