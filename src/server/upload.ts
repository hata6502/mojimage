import path from "node:path";

import { Storage } from "@google-cloud/storage";
import vision from "@google-cloud/vision";
import { ObjectId } from "mongodb";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { getImageBucketName, getOpenAIAPIKey } from "./env.js";
import { imageCollection } from "./image.js";
import { mongoClient } from "./mongodb.js";

const imageAnnotatorClient = new vision.ImageAnnotatorClient();
const openai = new OpenAI({ apiKey: getOpenAIAPIKey() });
const storage = new Storage();

try {
  const imageURL = "https://i.gyazo.com/b1946c2cb95ae1245182b1aff795a59e.jpg";
  const _id = new ObjectId();
  const ext = path.extname(imageURL);
  const fileName = `${_id}${ext}`;

  const imageResponse = await fetch(imageURL);
  if (!imageResponse.ok) {
    throw new Error("Failed to fetch image");
  }
  const image = new Uint8Array(await imageResponse.arrayBuffer());

  await storage.bucket(getImageBucketName()).file(fileName).save(image);

  const [{ textAnnotations }] = await imageAnnotatorClient.textDetection(
    `gs://${encodeURIComponent(getImageBucketName())}/${encodeURIComponent(fileName)}`,
  );
  if (!textAnnotations) {
    throw new Error("Failed to detect text");
  }
  const lang = textAnnotations[0].locale;
  if (!lang) {
    throw new Error("Failed to detect text language");
  }

  const analyzeResponse = await openai.responses.parse({
    model: "gpt-5.2",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_image",
            image_url: `https://storage.googleapis.com/${encodeURIComponent(getImageBucketName())}/${encodeURIComponent(fileName)}`,
            detail: "auto",
          },
        ],
      },
    ],
    text: {
      format: zodTextFormat(
        z.object({ alt: z.string().describe(lang) }),
        "analyzeResult",
      ),
    },
  });
  const analyzeResult = analyzeResponse.output_parsed;
  if (!analyzeResult) {
    throw new Error("Failed to analyze image");
  }

  await mongoClient.withSession((session) =>
    session.withTransaction(async (session) => {
      await imageCollection.insertOne(
        { _id, ext, alt: analyzeResult.alt, textAnnotations },
        { session },
      );
    }),
  );
} finally {
  await mongoClient.close();
}

/*
import stringWidth from "string-width";

const size = ({ left, top, right, bottom }) =>
  Math.min(right - left, bottom - top);

const getNeighborAnnotation = (a, b) => {
  const getIsIntersected = (margin) =>
    a.right + size(a) * margin >= b.left - size(b) * margin &&
    a.bottom + size(a) * margin >= b.top - size(b) * margin &&
    b.right + size(b) * margin >= a.left - size(a) * margin &&
    b.bottom + size(b) * margin >= a.top - size(a) * margin;
  if (!getIsIntersected(0.5)) {
    return;
  }

  const insertsLatinSpace =
    stringWidth(
      [...new Intl.Segmenter().segment(a.description)].at(-1)?.segment ?? "",
    ) < 2 &&
    stringWidth(
      [...new Intl.Segmenter().segment(b.description)].at(0)?.segment ?? "",
    ) < 2 &&
    !getIsIntersected(0.0625);

  const neighbor = {
    description: `${a.description}${insertsLatinSpace ? " " : ""}${b.description
      }`,
    left: Math.min(a.left, b.left),
    top: Math.min(a.top, b.top),
    right: Math.max(a.right, b.right),
    bottom: Math.max(a.bottom, b.bottom),
  };

  if (
    (stringWidth(a.description) >= 3 &&
      (size(neighbor) - size(a)) / size(a) >= 0.5) ||
    (stringWidth(b.description) >= 3 &&
      (size(neighbor) - size(b)) / size(b) >= 0.5)
  ) {
    return;
  }

  return neighbor;
};

const annotations = result.textAnnotations
  .slice(1)
  .map(({ description, boundingPoly }) => {
    const xs = boundingPoly.vertices.map(({ x }) => x);
    const ys = boundingPoly.vertices.map(({ y }) => y);

    return {
      description,
      left: Math.min(...xs),
      top: Math.min(...ys),
      right: Math.max(...xs),
      bottom: Math.max(...ys),
    };
  });
for (let aIndex = 0; aIndex < annotations.length - 1; aIndex++) {
  const bIndex = aIndex + 1;
  const mergedAnnotation = getNeighborAnnotation(
    annotations[aIndex],
    annotations[bIndex],
  );
  if (mergedAnnotation) {
    annotations[aIndex] = mergedAnnotation;
    annotations.splice(bIndex, 1);
    if (aIndex >= 1) {
      aIndex--;
    }
  }
}*/
