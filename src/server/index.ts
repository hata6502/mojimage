import compression from "compression";
import cors from "cors";
import express from "express";
import passport from "passport";

import { getNodeEnv } from "./env.js";
import { helmet } from "./helmet.js";
import { framesRouter } from "./frames.js";
import { imagesRouter } from "./images.js";
import { mongoClient } from "./mongodb.js";
import { getOEmbed } from "./oembed.js";
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

app.use(session);
app.use(passport.authenticate("session"));

app.use("/frames", framesRouter);
app.use("/images", imagesRouter);
app.get(
  "/oembed",
  cors(),
  helmet({ corp: "same-origin", embed: false }),
  getOEmbed,
);

app.use(
  "/",
  cors(),
  helmet({ corp: "same-origin", embed: false }),
  express.static("public"),
);

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
