import stringWidth from "string-width";

import type { TextAnnotation } from "../specification.js";

interface Annotation {
  description: string;
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export const adjustedAnnotations = (textAnnotations: TextAnnotation[]) => {
  const annotations = textAnnotations.slice(1).map((textAnnotation) => {
    const xs = textAnnotation.boundingPoly.vertices.map(({ x }) => x);
    const ys = textAnnotation.boundingPoly.vertices.map(({ y }) => y);

    return {
      description: textAnnotation.description,
      left: Math.min(...xs),
      top: Math.min(...ys),
      right: Math.max(...xs),
      bottom: Math.max(...ys),
    };
  });

  for (let aIndex = 0; aIndex < annotations.length - 1; aIndex++) {
    const bIndex = aIndex + 1;
    const mergedAnnotation = getNeighborAnnotation(
      annotations[aIndex],
      annotations[bIndex],
    );
    if (mergedAnnotation) {
      annotations[aIndex] = mergedAnnotation;
      annotations.splice(bIndex, 1);
      if (aIndex >= 1) {
        aIndex--;
      }
    }
  }

  return annotations;
};

const getNeighborAnnotation = (a: Annotation, b: Annotation) => {
  const getIsIntersected = (margin: number) =>
    a.right + size(a) * margin >= b.left - size(b) * margin &&
    a.bottom + size(a) * margin >= b.top - size(b) * margin &&
    b.right + size(b) * margin >= a.left - size(a) * margin &&
    b.bottom + size(b) * margin >= a.top - size(a) * margin;
  if (!getIsIntersected(0.5)) {
    return;
  }

  const insertsLatinSpace =
    stringWidth(
      [...new Intl.Segmenter().segment(a.description)].at(-1)?.segment ?? "",
    ) < 2 &&
    stringWidth(
      [...new Intl.Segmenter().segment(b.description)].at(0)?.segment ?? "",
    ) < 2 &&
    !getIsIntersected(0.0625);

  const neighbor = {
    description: `${a.description}${insertsLatinSpace ? " " : ""}${
      b.description
    }`,
    left: Math.min(a.left, b.left),
    top: Math.min(a.top, b.top),
    right: Math.max(a.right, b.right),
    bottom: Math.max(a.bottom, b.bottom),
  };

  if (
    (stringWidth(a.description) >= 3 &&
      (size(neighbor) - size(a)) / size(a) >= 0.5) ||
    (stringWidth(b.description) >= 3 &&
      (size(neighbor) - size(b)) / size(b) >= 0.5)
  ) {
    return;
  }

  return neighbor;
};

const size = ({ left, top, right, bottom }: Annotation) =>
  Math.min(right - left, bottom - top);
