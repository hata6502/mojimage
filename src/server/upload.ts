import path from "node:path";

import { Storage } from "@google-cloud/storage";
import vision from "@google-cloud/vision";
import { ObjectId } from "mongodb";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { textAnnotationSchema } from "../specification.js";
import { getImageBucketName, getOpenAIAPIKey } from "./env.js";
import { imageCollection } from "./image.js";
import { mongoClient } from "./mongodb.js";

const [, , imageURL, width, height] = process.argv;

const imageAnnotatorClient = new vision.ImageAnnotatorClient();
const openai = new OpenAI({ apiKey: getOpenAIAPIKey() });
const storage = new Storage();

try {
  const _id = new ObjectId();
  const ext = path.extname(imageURL);
  const fileName = `${_id}${ext}`;

  const imageResponse = await fetch(imageURL);
  if (!imageResponse.ok) {
    throw new Error("Failed to fetch image");
  }
  const image = new Uint8Array(await imageResponse.arrayBuffer());

  await storage.bucket(getImageBucketName()).file(fileName).save(image);

  const [annotateImageResponse] = await imageAnnotatorClient.textDetection(
    `gs://${encodeURIComponent(getImageBucketName())}/${encodeURIComponent(fileName)}`,
  );
  const textAnnotations = z
    .array(textAnnotationSchema.loose())
    .parse(annotateImageResponse.textAnnotations);

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
        z.object({ alt: z.string().describe(textAnnotations[0].locale) }),
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
        {
          _id,
          width: Number(width),
          height: Number(height),
          ext,
          alt: analyzeResult.alt,
          textAnnotations,
        },
        { session },
      );
    }),
  );

  console.log("Image uploaded and analyzed successfully:", {
    _id,
    alt: analyzeResult.alt,
  });
} finally {
  await mongoClient.close();
}
