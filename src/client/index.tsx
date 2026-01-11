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

        <section
          id="embed"
          className="prose dark:prose-invert space-y-3 sm:space-y-4"
        >
          <h2>Mojimageの埋め込み方</h2>
          <p>
            Mojimageにアップロードした画像は、以下の方法でサイトに埋め込むことができます
          </p>

          <h3>画像を直リンクで挿入する</h3>
          <p>
            画像一覧にて、画像アドレスやMarkdown、imgタグ等をコピーできます
            <br />
            画像は https://mojimage.hata6502.com/images/*
            の直リンクで挿入してください
          </p>
          <img
            src="https://mojimage.hata6502.com/images/69628ddd461725baa481e7b7"
            width="1424"
            height="564"
            alt="画像一覧の画面。右上の「&lt;/&gt;」ボタンを押して開いたメニューが赤枠で強調されており、「画像アドレスをコピー」「Markdownをコピー」「imgタグをコピー」「Mojimageの埋め込み方」が表示されている。左側には画像のサムネイルと説明文、右側に日付（2026/1/11）やゴミ箱アイコンがある。"
            className="h-auto max-w-full"
          />
          <p>
            <a href="https://wordpress.org/" target="_blank">
              WordPress
            </a>
            の場合
          </p>
          <img
            src="https://mojimage.hata6502.com/images/696282f834fcc32a4564adad"
            width="1608"
            height="666"
            alt="WordPressのブロックエディターで「画像」ブロックを追加している画面。『アップロード』『画像を選択』『AIで生成』『URLから挿入』のボタンがあり、下部にURL入力欄（https://mojimage.hata6502.com/images/6…）が表示されている。上部に『ブロックを選択するには「/」を入力』の案内もある。"
            className="h-auto max-w-full"
          />
          <p>
            <a href="https://studio.design/" target="_blank">
              Studio
            </a>
            の場合
          </p>
          <img
            src="https://mojimage.hata6502.com/images/696282ef34fcc32a4564adac"
            width="1526"
            height="656"
            alt='Web画面の「Embed」ダイアログ。左上に「Embed」、右上に「キャンセル」。中央に&lt;img src=… width="1876" height="1174" alt="…"&gt;というHTMLコードがテキストエリアに表示されており、alt属性には日本語で『日本語のWeb校正ツール「校正さん」の画面。左側の本文上部に赤枠で…という指摘が表示され、右側にはAIチャット欄が赤枠で表示され…』といった長い説明文が入っている。下部に黒い「更新」ボタンがある。背景には埋め込み先の入力欄が見える。'
            className="h-auto max-w-full"
          />
          <p>Markdownの場合</p>
          <img
            src="https://mojimage.hata6502.com/images/696282e134fcc32a4564adab"
            width="1612"
            height="434"
            alt="# mojimage

![日本語のWeb校正ツール「校正さん」の画面。左側の本文上部に赤枠で『本文の説得力を上げるため、自己評価の前提（対象範囲、準拠レベル、評価方法：手動/ツール、判断基準）を1〜3行で追記すると良いです。』という指摘が表示されている。右側にはAIチャット欄が赤枠で表示され、『今日はどんなお手伝いをしましょうか？』と、文章の見直し箇所の解説・他の見直し箇所表示・文章から読み取れる感情などの提案が並び、下部に入力欄『AIにメッセージを送信する』がある。]
(https://mojimage.hata6502.com/images/695c51ebd3f1f4631640653b)"
            className="h-auto max-w-full"
          />

          <h3>scriptタグを埋め込む</h3>
          <p>
            テキスト選択やページ内検索、SEO・AIOなどの機能を利用するためには、scriptタグをサイトに埋め込む必要があります
            <br />
            サイトの制作者や管理者に依頼する必要があるかもしれません
            <br />
            表示が崩れる場合は、
            <code>max-width: 100%;</code>や<code>height: auto;</code>
            などのスタイルを適用する必要があります
          </p>
          <pre>
            <code>
              &lt;script type=&quot;module&quot;
              src=&quot;https://mojimage.hata6502.com/embed.js&quot;&gt;&lt;/script&gt;
            </code>
          </pre>

          <h3>動作確認する</h3>
          <p>
            scriptタグの埋め込みに成功すれば、画像内のテキストを選択できたり、ブラウザのページ内検索の対象になります
            <br />
            ぜひお試しください
          </p>
          <img
            src="https://mojimage.hata6502.com/images/69635be39c32eab4578a035e"
            width="275"
            height="155"
            alt="この画像もテキスト選択したり、ページ内検索できます
ぜひお試しください"
            className="h-auto max-w-full"
          />
        </section>
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

            const handleCopyImgButtonClick = async () => {
              const imageElement = document.createElement("img");
              imageElement.src = String(imageURL);
              imageElement.width = image.width;
              imageElement.height = image.height;
              imageElement.alt = image.alt;

              await navigator.clipboard.writeText(imageElement.outerHTML);
            };

            const handleCopyMarkdownButtonClick = async () => {
              await navigator.clipboard.writeText(
                `![${image.alt}](${imageURL})`,
              );
            };

            const handleCopyCosenseButtonClick = async () => {
              await navigator.clipboard.writeText(`[${imageURL}#.png]`);
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
                    className="h-auto w-20 rounded-md"
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
                            onClick={handleCopyImgButtonClick}
                            className="block w-full px-4 py-2 text-left text-sm text-zinc-700 data-focus:bg-zinc-100 data-focus:text-zinc-900 data-focus:outline-hidden dark:text-zinc-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                          >
                            imgタグをコピー
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
                            onClick={handleCopyCosenseButtonClick}
                            className="block w-full px-4 py-2 text-left text-sm text-zinc-700 data-focus:bg-zinc-100 data-focus:text-zinc-900 data-focus:outline-hidden dark:text-zinc-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                          >
                            Cosense記法をコピー
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
