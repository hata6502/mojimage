import { useEffect, useRef, useState } from "react";
import type { FunctionComponent, ReactEventHandler } from "react";
import stringWidth from "string-width";

import { adjustedAnnotations } from "../annotation.js";
import { imageJSONSchema } from "../specification.js";
import { createApp } from "./app.js";

const imageJSON = document.querySelector("#image")?.textContent;
if (!imageJSON) {
  throw new Error("Image data not found");
}
const image = imageJSONSchema.parse(JSON.parse(imageJSON));

const App: FunctionComponent = () => {
  const [imageNaturalWidth, setImageNaturalWidth] = useState(0);
  const [imageNaturalHeight, setImageNaturalHeight] = useState(0);

  const [resizeCount, setResizeCount] = useState(0);

  const textLayer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setResizeCount((prevResizeCount) => prevResizeCount + 1);
    };
    addEventListener("resize", handleResize);
    return () => {
      removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!textLayer.current) {
      return;
    }
    const currentTextLayer = textLayer.current;

    for (const annotation of adjustedAnnotations(image.textAnnotations)) {
      const left = (annotation.left / imageNaturalWidth) * innerWidth;
      const top = (annotation.top / imageNaturalHeight) * innerHeight;
      const width =
        ((annotation.right - annotation.left) / imageNaturalWidth) * innerWidth;
      const height =
        ((annotation.bottom - annotation.top) / imageNaturalHeight) *
        innerHeight;

      const defaultFontSize = Math.min(width, height);
      const expectedLength = Math.max(width, height);
      // 例えば「it」2文字だと、widthよりもheightの方が大きいため、縦書きとして判定されてしまう
      // 実際には横書きであることが多いため、2文字以下の場合は横書きとして判定させる
      const horizontal =
        stringWidth(annotation.description) < 3 || width >= height;

      const text = document.createElement("span");
      text.classList.add(
        "absolute",
        "leading-none",
        "text-transparent",
        "whitespace-nowrap",
        "selection:bg-blue-200",
        "selection:text-black",
      );
      text.style.left = `${left}px`;
      text.style.top = `${top}px`;
      text.style.letterSpacing = "0";
      text.style.fontSize = `${defaultFontSize}px`;
      text.style.width = "";
      text.style.height = "";
      text.style.writingMode = horizontal ? "horizontal-tb" : "vertical-rl";
      text.textContent = annotation.description;
      currentTextLayer.append(text);

      const rect = text.getBoundingClientRect();
      const actualLength = Math.max(rect.width, rect.height);
      text.style.letterSpacing = `${
        Math.max(expectedLength - actualLength, 0) /
        [...new Intl.Segmenter().segment(annotation.description)].length
      }px`;
      text.style.fontSize = `${
        defaultFontSize * Math.min(expectedLength / actualLength, 1)
      }px`;
      text.style.width = `${width}px`;
      text.style.height = `${height}px`;
    }

    return () => {
      currentTextLayer.replaceChildren();
    };
  }, [image, imageNaturalWidth, imageNaturalHeight, resizeCount]);

  const handleImageLoad: ReactEventHandler<HTMLImageElement> = (event) => {
    setImageNaturalWidth(event.currentTarget.naturalWidth);
    setImageNaturalHeight(event.currentTarget.naturalHeight);
  };

  return (
    <>
      <img
        src={`/images/${encodeURIComponent(image.id)}`}
        alt={image.alt}
        className="select-none"
        style={{ width: innerWidth, height: innerHeight }}
        onLoad={handleImageLoad}
      />

      <div ref={textLayer} className="absolute top-0 left-0" />
    </>
  );
};

await createApp(<App />);
