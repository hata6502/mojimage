import express from "express";
import { ObjectId } from "mongodb";
import { renderToStaticMarkup } from "react-dom/server";

import type { ImageJSON } from "../specification.js";
import { getImageBucketName } from "./env.js";
import { helmet } from "./helmet.js";
import { imageCollection } from "./image.js";

export const imagesRouter = express.Router({ strict: true });

imagesRouter.get("/:imageID", helmet(), async (req, res) => {
  const { imageID } = req.params;

  const image = await imageCollection.findOne({ _id: new ObjectId(imageID) });
  if (!image) {
    res.status(404).end();
    return;
  }

  const imageJSON: ImageJSON = {
    id: String(image._id),
    width: image.width,
    height: image.height,
    ext: image.ext,
    alt: image.alt,
    textAnnotations: image.textAnnotations,
    bucketName: getImageBucketName(),
  };

  res.send(`<!DOCTYPE html>
${renderToStaticMarkup(
  <html lang={image.textAnnotations[0].locale}>
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      <title>{image.alt}</title>

      <meta name="description" content={image.textAnnotations[0].description} />

      <link rel="apple-touch-icon" href="/favicon.png" />
      <link rel="icon" type="image/png" href="/favicon.png" />
      <link rel="manifest" href="/manifest.json" />

      <link rel="stylesheet" href="/index.css" />
    </head>

    <body>
      <script id="image" type="application/json">
        {JSON.stringify(imageJSON)}
      </script>

      <script type="module" src="/index.js"></script>
    </body>
  </html>,
)}`);
});
