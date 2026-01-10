import { PhotoIcon } from "@heroicons/react/24/outline";
import { Suspense, use, useMemo, useState } from "react";
import type {
  ChangeEventHandler,
  DragEventHandler,
  FunctionComponent,
} from "react";

import {
  authedUserResponseSchema,
  uploadedImagesResponseSchema,
} from "../specification.js";
import type {
  AuthedUserResponse,
  UploadImageRequest,
  UploadedImagesResponse,
} from "../specification.js";
import { createApp } from "./app.js";

const App: FunctionComponent<{
  authedUserPromise: Promise<AuthedUserResponse["authedUser"]>;
}> = ({ authedUserPromise }) => {
  const authedUser = use(authedUserPromise);

  const [uploadProgress, setUploadProgress] = useState(0);
  const uploadPercent = Math.round(uploadProgress * 100);

  const uploadedImagesPromise = useMemo(async () => {
    const uploadedImagesResponse = await fetch("/images/uploaded");
    if (!uploadedImagesResponse.ok) {
      throw new Error("Failed to fetch uploaded images");
    }
    const { images } = uploadedImagesResponseSchema.parse(
      await uploadedImagesResponse.json(),
    );
    return images;
  }, [uploadProgress]);

  const uploadImages = async (files: File[]) => {
    try {
      for (const [fileIndex, file] of files.entries()) {
        setUploadProgress((fileIndex + 1) / files.length);

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
      }
    } finally {
      setUploadProgress(0);
    }
  };

  const handleUploadImagesDragOver: DragEventHandler = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleUploadImagesDrop: DragEventHandler = async (event) => {
    event.preventDefault();
    await uploadImages(
      [...event.dataTransfer.items].flatMap((item) => {
        const file = item.getAsFile();
        return file ? [file] : [];
      }),
    );
  };

  const handleUploadImagesInputChange: ChangeEventHandler<
    HTMLInputElement
  > = async (event) => {
    await uploadImages([...(event.target.files ?? [])]);
  };

  return (
    <div className="min-h-screen bg-white px-4 py-10 text-zinc-950 antialiased dark:bg-zinc-950 dark:text-white">
      <header className="mx-auto mb-6 flex w-full max-w-5xl items-center gap-4 px-6 py-2.5 sm:px-10">
        <div className="flex items-center gap-3">
          {authedUser ? (
            <>
              <img
                src={authedUser.photo}
                alt={authedUser.name}
                className="size-8 rounded-full border border-zinc-950/10 object-cover dark:border-white/10"
              />
              <span className="text-sm/6 font-semibold text-zinc-900 dark:text-white">
                {authedUser.name}
              </span>
            </>
          ) : (
            <a
              href="/auth/login/google"
              className="rounded-md border border-zinc-950/10 bg-white px-3 py-1.5 text-sm/6 font-semibold text-zinc-900 transition hover:border-zinc-950/20 hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none dark:border-white/10 dark:bg-zinc-900/60 dark:text-white dark:hover:border-white/20 dark:hover:bg-white/5"
            >
              ログイン
            </a>
          )}
        </div>

        <div aria-hidden="true" className="-ml-4 flex-1" />

        <div className="flex items-center gap-3">
          <a
            href="https://help.hata6502.com/?q=Mojimage"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg p-2 text-sm/6 font-semibold text-zinc-900 transition hover:bg-zinc-950/5 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none dark:text-white dark:hover:bg-white/5"
          >
            Mojimageとは?
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl space-y-10 bg-white px-6 py-8 sm:px-10 dark:bg-zinc-900/80">
        {authedUser && (
          <>
            <section className="space-y-3 sm:space-y-4">
              <label
                onDragOver={handleUploadImagesDragOver}
                onDrop={handleUploadImagesDrop}
                className="group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-blue-600/40 bg-blue-50/60 px-6 py-10 text-center text-sm/6 text-blue-900 transition focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:outline-hidden hover:border-blue-600/60 hover:bg-blue-50/80 dark:border-blue-400/40 dark:bg-blue-500/10 dark:text-blue-100 dark:hover:border-blue-300/60 dark:hover:bg-blue-500/15"
              >
                <span className="text-base/6 font-semibold text-blue-950 dark:text-white">
                  画像をドロップまたはクリックしてアップロード
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleUploadImagesInputChange}
                  className="hidden"
                />

                {Boolean(uploadProgress) && (
                  <div className="mt-3 w-full max-w-lg px-1 text-left">
                    <div className="h-2 w-full rounded-sm bg-zinc-950/5 dark:bg-white/10">
                      <div
                        className="h-full rounded-sm bg-blue-600 transition-[width] duration-300 ease-out"
                        style={{ width: `${uploadPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </label>
            </section>

            <section className="bg-white p-2 dark:bg-zinc-900/80">
              <div className="-mx-2 overflow-x-auto sm:mx-0">
                <Suspense>
                  <UploadedImages
                    uploadedImagesPromise={uploadedImagesPromise}
                  />
                </Suspense>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

await createApp(
  <App
    authedUserPromise={(async () => {
      const authedUserResponse = await fetch("/auth/user");
      if (!authedUserResponse.ok) {
        throw new Error("Failed to fetch authenticated user");
      }
      const { authedUser } = authedUserResponseSchema.parse(
        await authedUserResponse.json(),
      );
      return authedUser;
    })()}
  />,
);

const UploadedImages: FunctionComponent<{
  uploadedImagesPromise: Promise<UploadedImagesResponse["images"]>;
}> = ({ uploadedImagesPromise }) => {
  const uploadedImages = use(uploadedImagesPromise);

  if (!uploadedImages.length) {
    return (
      <div className="rounded-lg bg-white px-6 py-10 text-center dark:bg-zinc-900/60">
        <PhotoIcon
          aria-hidden="true"
          className="mx-auto size-11 text-zinc-400 dark:text-zinc-500"
        />
        <h3 className="mt-3 text-sm/6 font-semibold text-zinc-900 dark:text-white">
          アップロードした画像がここに表示されます
        </h3>
      </div>
    );
  }

  return (
    <table className="min-w-[460px] text-left text-xs/5 text-zinc-950 sm:min-w-full sm:text-sm/6 dark:text-white">
      <thead className="font-semibold text-zinc-400 uppercase dark:text-zinc-500">
        <tr>
          <th scope="col" className="w-24 pb-2"></th>
          <th scope="col" className="pb-2">
            代替テキスト
          </th>
          <th scope="col" className="pb-2">
            アップロード日時
          </th>
        </tr>
      </thead>

      <tbody className="divide-y divide-zinc-950/5 dark:divide-white/10">
        {uploadedImages.map((image) => (
          <tr key={image.id} className="hover:bg-zinc-50 dark:hover:bg-white/5">
            <th scope="row" className="w-24 py-2 pr-4 align-top">
              <img
                src={`/images/${encodeURIComponent(image.id)}`}
                alt={image.alt}
                className="size-20 object-cover"
              />
            </th>
            <td className="py-2 pr-4 text-xs/5 break-words whitespace-normal text-zinc-600 sm:text-sm/6 dark:text-zinc-300">
              {image.alt}
            </td>
            <td className="py-2 text-xs/5 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">
              {new Date(image.uploadedDate).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
