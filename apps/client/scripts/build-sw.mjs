import { build } from "esbuild";

await build({
  entryPoints: ["app/sw.ts"],
  bundle: true,
  minify: true,
  outdir: "public",
  format: "esm",
  target: "es2022",
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});

console.log("✅ Service worker built to public/sw.js");
