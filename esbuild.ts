import * as esbuild from "esbuild";

await Promise.all(
  [
    { entryPoints: ["src/client/embed.ts"], outfile: "public/embed.js" },
    { entryPoints: ["src/client/frame.tsx"], outfile: "public/frame.js" },
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
