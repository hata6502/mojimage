import { Storage } from "@google-cloud/storage";
import vision from "@google-cloud/vision";
import express from "express";
import { Jimp } from "jimp";
import { ObjectId } from "mongodb";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import {
  textAnnotationSchema,
  uploadImageRequestSchema,
} from "../specification.js";
import type { UploadedImagesResponse } from "../specification.js";
import { getImageBucketName, getOpenAIAPIKey } from "./env.js";
import { helmet } from "./helmet.js";
import { imageCollection } from "./image.js";
import { mongoClient } from "./mongodb.js";

const imageAnnotatorClient = new vision.ImageAnnotatorClient();
const openai = new OpenAI({ apiKey: getOpenAIAPIKey() });
const storage = new Storage();

export const imagesRouter = express.Router({ strict: true });

imagesRouter.post(
  "/upload",
  helmet({ corp: "same-origin", embed: false }),
  async (req, res) => {
    const authedUser = req.user;
    if (!authedUser) {
      res.status(401).end();
      return;
    }

    const { data } = uploadImageRequestSchema.safeParse(req.body);
    if (!data) {
      res.status(400).end();
      return;
    }

    const imageResponse = await fetch(data.image);
    const image = await imageResponse.blob();

    const ext = new Map([
      ["image/jpeg", ".jpg"],
      ["image/png", ".png"],
    ]).get(image.type);
    if (!ext) {
      res.status(400).end();
      return;
    }

    const _id = new ObjectId();
    const fileName = `${_id}${ext}`;

    await storage
      .bucket(getImageBucketName())
      .file(fileName)
      .save(new Uint8Array(await image.arrayBuffer()));

    const jimpImage = await Jimp.fromBuffer(await image.arrayBuffer());

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
            width: jimpImage.bitmap.width,
            height: jimpImage.bitmap.height,
            ext,
            alt: analyzeResult.alt,
            textAnnotations,
            uploadedDate: new Date(),
            userID: authedUser._id,
          },
          { session },
        );
      }),
    );

    res.status(200).end();
  },
);

imagesRouter.get(
  "/uploaded",
  helmet({ corp: "same-origin", embed: false }),
  async (req, res) => {
    const authedUser = req.user;
    if (!authedUser) {
      res.status(401).end();
      return;
    }

    const images = await imageCollection
      .find({ userID: authedUser._id })
      .sort({ uploadedDate: -1 })
      .toArray();

    res.json({
      images: images.map(({ _id, alt, uploadedDate }) => ({
        id: String(_id),
        alt,
        uploadedDate: uploadedDate.toISOString(),
      })),
    } satisfies UploadedImagesResponse);
  },
);

imagesRouter.get(
  "/:imageID",
  helmet({ corp: "cross-origin", embed: false }),
  async (req, res) => {
    const { imageID } = req.params;

    const image = await imageCollection.findOne({ _id: new ObjectId(imageID) });
    if (!image) {
      res.status(404).end();
      return;
    }

    res.redirect(
      `https://storage.googleapis.com/${encodeURIComponent(getImageBucketName())}/${encodeURIComponent(String(image._id))}${encodeURIComponent(image.ext)}`,
    );
  },
);
