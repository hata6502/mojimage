import { z } from "zod";

export const textAnnotationSchema = z.object({
  locale: z.string(),
  description: z.string(),
  boundingPoly: z.object({
    vertices: z.tuple([
      z.object({ x: z.number(), y: z.number() }),
      z.object({ x: z.number(), y: z.number() }),
      z.object({ x: z.number(), y: z.number() }),
      z.object({ x: z.number(), y: z.number() }),
    ]),
  }),
});
export type TextAnnotation = z.infer<typeof textAnnotationSchema>;

export const imageJSONSchema = z.object({
  id: z.string(),
  alt: z.string(),
  textAnnotations: z.array(textAnnotationSchema),
});
export type ImageJSON = z.infer<typeof imageJSONSchema>;

export type OEmbedRequest = z.infer<typeof oEmbedRequestSchema>;
export const oEmbedRequestSchema = z.object({
  url: z.string(),
  format: z.literal("json"),
});
export type OEmbedResponse = z.infer<typeof oEmbedResponseSchema>;
export const oEmbedResponseSchema = z.object({
  type: z.literal("rich"),
  version: z.literal("1.0"),
  html: z.string(),
  width: z.number(),
  height: z.number(),
});

export type AuthedUserResponse = z.infer<typeof authedUserResponseSchema>;
export const authedUserResponseSchema = z.object({
  authedUser: z
    .object({
      id: z.string(),
      name: z.string(),
      photo: z.string().optional(),
    })
    .optional(),
});

export type UploadImageRequest = z.infer<typeof uploadImageRequestSchema>;
export const uploadImageRequestSchema = z.object({
  image: z.url({ protocol: /^data$/ }),
  width: z.number(),
  height: z.number(),
});

export type UploadedImagesResponse = z.infer<
  typeof uploadedImagesResponseSchema
>;
export const uploadedImagesResponseSchema = z.object({
  images: z.array(
    z.object({
      id: z.string(),
      width: z.number(),
      height: z.number(),
      alt: z.string(),
      textAnnotations: z.array(textAnnotationSchema),
      uploadedDate: z.string(),
    }),
  ),
});
