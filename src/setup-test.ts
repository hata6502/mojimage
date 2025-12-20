import path from "node:path";
import { snapshot } from "node:test";

snapshot.setResolveSnapshotPath((testFilePath) => {
  if (!testFilePath) {
    throw new Error("testFilePath is required");
  }

  const srcPath = testFilePath.replace(
    path.resolve("dist"),
    path.resolve("src"),
  );

  return path.join(
    path.dirname(srcPath),
    `${path.basename(srcPath, path.extname(srcPath))}.snapshot.cjs`,
  );
});
