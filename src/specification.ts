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
  width: z.number(),
  height: z.number(),
  ext: z.string(),
  alt: z.string(),
  textAnnotations: z.array(textAnnotationSchema),
  bucketName: z.string(),
});
export type ImageJSON = z.infer<typeof imageJSONSchema>;
