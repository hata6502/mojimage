import { ObjectId } from "mongodb";

import type { TextAnnotation } from "../specification.js";
import { mongoDB } from "./mongodb.js";

export interface ImageDocument {
  width: number;
  height: number;
  ext: string;
  alt: string;
  textAnnotations: TextAnnotation[];
  userID: ObjectId;
}
export const imageCollection = mongoDB.collection<ImageDocument>("image");
