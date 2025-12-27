import type { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { renderToStaticMarkup } from "react-dom/server";

import type { ImageJSON } from "../specification.js";
import { getImageBucketName } from "./env.js";
import { imageCollection } from "./image.js";

export const getIndex: RequestHandler = async (_req, res) => {
  const image = await imageCollection.findOne({
    _id: new ObjectId("695014bdf34a3c2402f76daf"),
  });
  if (!image) {
    res.status(404).end();
    return;
  }

  const imageJSON: ImageJSON = {
    id: String(image._id),
    ext: image.ext,
    alt: image.alt,
    textAnnotations: image.textAnnotations,
    bucketName: getImageBucketName(),
  };

  res.send(`<!DOCTYPE html>
${renderToStaticMarkup(
  <html lang="ja">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      <title>Mojimage</title>

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
};
