import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {
  CodeBracketIcon,
  PhotoIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Suspense, use, useMemo, useState } from "react";
import type {
  ChangeEventHandler,
  Dispatch,
  DragEventHandler,
  FunctionComponent,
  SetStateAction,
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

  const [deleteImageCount, setDeleteImageCount] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadedImagesPromise = useMemo(async () => {
    const uploadedImagesResponse = await fetch("/images/uploaded");
    if (!uploadedImagesResponse.ok) {
      throw new Error("Failed to fetch uploaded images");
    }
    const { images } = uploadedImagesResponseSchema.parse(
      await uploadedImagesResponse.json(),
    );
    return images;
  }, [deleteImageCount, uploadProgress]);

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
                  <div className="mt-4 w-full max-w-lg">
                    <div
                      role="progressbar"
                      aria-valuenow={uploadProgress * 100}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      className="overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10"
                    >
                      <div
                        className="h-2 rounded-full bg-blue-600 dark:bg-blue-500"
                        style={{ width: `${uploadProgress * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </label>
            </section>

            <section className="space-y-3 sm:space-y-4">
              <Suspense>
                <UploadedImages
                  uploadedImagesPromise={uploadedImagesPromise}
                  setDeleteImageCount={setDeleteImageCount}
                />
              </Suspense>
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
  setDeleteImageCount: Dispatch<SetStateAction<number>>;
}> = ({ uploadedImagesPromise, setDeleteImageCount }) => {
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
    <div className="overflow-x-auto">
      <table className="min-w-[460px] text-left text-sm/6 text-zinc-950 sm:min-w-full dark:text-white">
        <thead className="text-zinc-500 dark:text-zinc-400">
          <tr>
            <th
              scope="col"
              className="min-w-24 border-b border-b-zinc-950/10 px-4 py-2 font-medium uppercase dark:border-b-white/10"
            ></th>

            <th
              scope="col"
              className="min-w-[240px] border-b border-b-zinc-950/10 px-4 py-2 text-left text-xs/5 font-medium uppercase dark:border-b-white/10"
            >
              代替テキスト
            </th>

            <th
              scope="col"
              className="border-b border-b-zinc-950/10 px-4 py-2 text-left text-xs/5 font-medium uppercase dark:border-b-white/10"
            >
              アップロード日時
            </th>

            <th
              scope="col"
              className="border-b border-b-zinc-950/10 px-4 py-2 text-right text-xs/5 font-medium uppercase dark:border-b-white/10"
            ></th>
          </tr>
        </thead>

        <tbody>
          {uploadedImages.map((image) => {
            const imageURL = new URL(
              `/images/${encodeURIComponent(image.id)}`,
              location.href,
            );

            const handleDeleteButtonClick = async () => {
              if (
                !confirm(
                  `画像「${image.alt.slice(0, 10)}…」を削除しますか?
この操作は取り消せません
`,
                )
              ) {
                return;
              }

              const deleteImageResponse = await fetch(
                `/images/${encodeURIComponent(image.id)}`,
                { method: "DELETE" },
              );
              if (!deleteImageResponse.ok) {
                throw new Error("Failed to delete image");
              }

              setDeleteImageCount((deleteImageCount) => deleteImageCount + 1);
            };

            const handleCopyImageURLButtonClick = async () => {
              await navigator.clipboard.writeText(String(imageURL));
            };

            const handleCopyMarkdownButtonClick = async () => {
              await navigator.clipboard.writeText(
                `![${image.alt}](${imageURL})`,
              );
            };

            const handleCopyImgButtonClick = async () => {
              const imageElement = document.createElement("img");
              imageElement.src = String(imageURL);
              imageElement.width = image.width;
              imageElement.height = image.height;
              imageElement.alt = image.alt;

              await navigator.clipboard.writeText(imageElement.outerHTML);
            };

            return (
              <tr
                key={image.id}
                className="hover:bg-zinc-950/2.5 dark:hover:bg-white/5"
              >
                <th
                  scope="row"
                  className="border-b border-zinc-950/5 px-4 py-3 align-middle dark:border-white/5"
                >
                  <img
                    src={`/images/${encodeURIComponent(image.id)}`}
                    alt={image.alt}
                    className="size-20 rounded-md object-cover"
                  />
                </th>

                <td className="border-b border-zinc-950/5 px-4 py-3 text-sm/6 break-words whitespace-normal text-zinc-600 dark:border-white/5 dark:text-zinc-300">
                  {image.alt}
                </td>

                <td className="border-b border-zinc-950/5 px-4 py-3 text-sm/6 text-zinc-500 dark:border-white/5 dark:text-zinc-400">
                  {new Date(image.uploadedDate).toLocaleString()}
                </td>

                <td className="border-b border-zinc-950/5 px-4 py-3 text-right align-middle dark:border-white/5">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-950/5 hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-200"
                      onClick={handleDeleteButtonClick}
                    >
                      <TrashIcon aria-hidden="true" className="size-5" />
                    </button>

                    <Menu as="div" className="relative inline-block text-left">
                      <MenuButton className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-950/5 hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-200">
                        <CodeBracketIcon
                          aria-hidden="true"
                          className="size-5"
                        />
                      </MenuButton>

                      <MenuItems
                        transition
                        anchor="bottom end"
                        portal
                        className="z-20 w-56 origin-top-right rounded-md bg-white shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in dark:bg-zinc-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10"
                      >
                        <div className="py-1">
                          <MenuItem
                            as="button"
                            onClick={handleCopyImageURLButtonClick}
                            className="block w-full px-4 py-2 text-left text-sm text-zinc-700 data-focus:bg-zinc-100 data-focus:text-zinc-900 data-focus:outline-hidden dark:text-zinc-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                          >
                            画像アドレスをコピー
                          </MenuItem>

                          <MenuItem
                            as="button"
                            onClick={handleCopyMarkdownButtonClick}
                            className="block w-full px-4 py-2 text-left text-sm text-zinc-700 data-focus:bg-zinc-100 data-focus:text-zinc-900 data-focus:outline-hidden dark:text-zinc-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                          >
                            Markdownをコピー
                          </MenuItem>

                          <MenuItem
                            as="button"
                            onClick={handleCopyImgButtonClick}
                            className="block w-full px-4 py-2 text-left text-sm text-zinc-700 data-focus:bg-zinc-100 data-focus:text-zinc-900 data-focus:outline-hidden dark:text-zinc-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                          >
                            imgタグをコピー
                          </MenuItem>

                          <MenuItem
                            as="a"
                            href="#embed"
                            className="block px-4 py-2 text-sm text-zinc-700 data-focus:bg-zinc-100 data-focus:text-zinc-900 data-focus:outline-hidden dark:text-zinc-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                          >
                            Mojimageの埋め込み方
                          </MenuItem>
                        </div>
                      </MenuItems>
                    </Menu>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
