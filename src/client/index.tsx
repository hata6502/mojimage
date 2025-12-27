import type { FunctionComponent } from "react";

import { imageJSONSchema } from "../specification.js";
import { createApp } from "./app.js";

const imageJSON = document.querySelector("#image")?.textContent;
if (!imageJSON) {
  throw new Error("Image data not found");
}
const image = imageJSONSchema.parse(JSON.parse(imageJSON));

const App: FunctionComponent = () => {
  return (
    <>
      <img
        src={`https://storage.googleapis.com/${encodeURIComponent(image.bucketName)}/${encodeURIComponent(image.id)}${encodeURIComponent(image.ext)}`}
        alt={image.alt}
      />
    </>
  );
};

await createApp(<App />);
