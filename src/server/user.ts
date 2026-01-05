import { mongoDB } from "./mongodb.js";

export interface UserDocument {
  name: string;
  emails: { value: string; verified: boolean }[];
  photos?: { value: string }[] | null;
}
export const userCollection = mongoDB.collection<UserDocument>("users");
