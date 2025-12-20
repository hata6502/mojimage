import compression from "compression";
import express from "express";
import passport from "passport";

import { getNodeEnv } from "./env.js";
import { helmet } from "./helmet.js";
import { getIndex } from "./index-router.js";
import { mongoClient } from "./mongodb.js";
import { session } from "./session.js";

const app = express();

app.set("strict routing", true);
app.set(
  "trust proxy",
  {
    development: 0,
    // Cloud Run
    production: 1,
  }[getNodeEnv()],
);

app.use(compression());
app.use(express.json());
app.use(helmet);

app.use(session);
app.use(passport.authenticate("session"));

app.get("/", getIndex);

app.use("/", express.static("public"));

const server = app.listen(8080);

process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing HTTP server");

  await new Promise<void>((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });

  await mongoClient.close();

  console.log("HTTP server closed");
});
