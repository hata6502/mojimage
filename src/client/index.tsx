import type { ChangeEventHandler, FunctionComponent } from "react";

import {
  authedUserResponseSchema,
  uploadImageResponseSchema,
} from "../specification.js";
import type { UploadImageRequest } from "../specification.js";
import { createApp } from "./app.js";

const authedUserResponse = await fetch("/auth/user");
if (!authedUserResponse.ok) {
  throw new Error("Failed to fetch authenticated user");
}
const { authedUser } = authedUserResponseSchema.parse(
  await authedUserResponse.json(),
);

if (!authedUser) {
  location.href = "/auth/login/google";
  throw new Error("Redirecting to login");
}

const App: FunctionComponent = () => {
  const handleImageInputChange: ChangeEventHandler<HTMLInputElement> = async (
    event,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const image = await new Promise<string>((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        if (typeof fileReader.result !== "string") {
          reject(new Error("Failed to read file"));
          return;
        }

        resolve(fileReader.result);
      };
      fileReader.onerror = () => {
        reject(fileReader.error);
      };
      fileReader.readAsDataURL(file);
    });

    const uploadImageResponse = await fetch("/images/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image } satisfies UploadImageRequest),
    });
    if (!uploadImageResponse.ok) {
      throw new Error("Failed to upload image");
    }
    const uploadedImage = uploadImageResponseSchema.parse(
      await uploadImageResponse.json(),
    );

    location.href = `/images/${encodeURIComponent(uploadedImage.id)}`;
  };

  return (
    <>
      {authedUser.name}

      <div>
        アップロード
        <input type="file" accept="image/*" onChange={handleImageInputChange} />
      </div>
    </>
  );
};

await createApp(<App />);
