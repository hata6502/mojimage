import type { RequestHandler } from "express";
import { renderToStaticMarkup } from "react-dom/server";

export const getIndex: RequestHandler = async (_req, res) => {
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
      <script type="module" src="/index.js"></script>
    </body>
  </html>,
)}`);
};
