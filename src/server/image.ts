import { mongoDB } from "./mongodb.js";

export interface ImageDocument {
  ext: string;
  alt: string;
  textAnnotations: {}[];
}
export const imageCollection = mongoDB.collection<ImageDocument>("image");
