import express from "express";
import { ObjectId } from "mongodb";

import { getImageBucketName } from "./env.js";
import { helmet } from "./helmet.js";
import { imageCollection } from "./image.js";

export const imagesRouter = express.Router({ strict: true });

imagesRouter.get("/:imageID", helmet({ embed: false }), async (req, res) => {
  const { imageID } = req.params;

  const image = await imageCollection.findOne({ _id: new ObjectId(imageID) });
  if (!image) {
    res.status(404).end();
    return;
  }

  res.redirect(
    `https://storage.googleapis.com/${encodeURIComponent(getImageBucketName())}/${encodeURIComponent(String(image._id))}${encodeURIComponent(image.ext)}`,
  );
});
