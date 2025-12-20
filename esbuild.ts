import * as esbuild from "esbuild";

await Promise.all(
  [
    { entryPoints: ["src/client/index.tsx"], outfile: "public/index.js" },
    {
      entryPoints: ["src/client/service-worker.ts"],
      outfile: "public/service-worker.js",
    },
  ].map((options) =>
    esbuild.build({
      ...options,
      bundle: true,
      define: {
        "process.env.TIMESTAMP": JSON.stringify(String(Date.now())),
      },
      format: "esm",
      minify: true,
    }),
  ),
);
