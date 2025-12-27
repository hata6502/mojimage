import type { TextAnnotation } from "../specification.js";
import { mongoDB } from "./mongodb.js";

export interface ImageDocument {
  ext: string;
  alt: string;
  textAnnotations: TextAnnotation[];
}
export const imageCollection = mongoDB.collection<ImageDocument>("image");
