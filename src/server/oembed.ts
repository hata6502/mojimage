import type { RequestHandler } from "express";
import { JSDOM } from "jsdom";
import { ObjectId } from "mongodb";

import { oEmbedRequestSchema } from "../specification.js";
import type { OEmbedResponse } from "../specification.js";
import { getAppURL } from "./env.js";
import { imageCollection } from "./image.js";

export const getOEmbed: RequestHandler = async (req, res) => {
  const { data } = oEmbedRequestSchema.safeParse(req.query);
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
      new URL(`frames/${encodeURIComponent(String(image._id))}`, getAppURL()),
    );
    iframe.role = "img";
    iframe.title = image.alt;
    iframe.style.aspectRatio = `${image.width} / ${image.height}`;
    iframe.style.border = "none";

    const overallTextAnnotation = image.textAnnotations.at(0);
    if (overallTextAnnotation) {
      iframe.lang = overallTextAnnotation.locale;
      iframe.ariaDescription = overallTextAnnotation.description;
    }

    window.document.body.append(iframe);

    res.json({
      type: "rich",
      version: "1.0",
      html: window.document.body.innerHTML,
      width: image.width,
      height: image.height,
    } satisfies OEmbedResponse);
    return;
  }

  res.status(404).end();
};
