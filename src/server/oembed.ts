import type { RequestHandler } from "express";
import { JSDOM } from "jsdom";
import { ObjectId } from "mongodb";
import { z } from "zod";

import { getAppURL } from "./env.js";
import { imageCollection } from "./image.js";

export const getOEmbed: RequestHandler = async (req, res) => {
  const { data } = z
    .object({ url: z.string(), format: z.literal("json") })
    .safeParse(req.query);
  if (!data) {
    res.status(400).end();
    return;
  }

  if (!data.url.startsWith(getAppURL())) {
    res.status(404).end();
    return;
  }
  const path = data.url.slice(getAppURL().length);

  const imageURLPatternResult = new URLPattern({
    pathname: "/images/:imageID",
  }).exec(path);
  if (imageURLPatternResult) {
    const { imageID } = imageURLPatternResult.pathname.groups;
    if (!imageID) {
      throw new Error("Invalid image ID");
    }

    const image = await imageCollection.findOne({ _id: new ObjectId(imageID) });
    if (!image) {
      res.status(404).end();
      return;
    }

    const { window } = new JSDOM();

    const iframe = window.document.createElement("iframe");
    iframe.width = String(image.width);
    iframe.height = String(image.height);
    iframe.src = String(
      new URL(`images/${encodeURIComponent(String(image._id))}`, getAppURL()),
    );
    iframe.lang = image.textAnnotations[0].locale;
    iframe.role = "img";
    iframe.title = image.alt;
    iframe.ariaDescription = image.textAnnotations[0].description;
    window.document.body.append(iframe);

    res.json({
      type: "rich",
      version: "1.0",
      html: window.document.body.innerHTML,
      width: image.width,
      height: image.height,
    });
    return;
  }

  res.status(404).end();
};
