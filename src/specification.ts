import { z } from "zod";

export const textAnnotationSchema = z.object({});
export type TextAnnotation = z.infer<typeof textAnnotationSchema>;

export const imageJSONSchema = z.object({
  id: z.string(),
  ext: z.string(),
  alt: z.string(),
  textAnnotations: z.array(textAnnotationSchema),
  bucketName: z.string(),
});
export type ImageJSON = z.infer<typeof imageJSONSchema>;
