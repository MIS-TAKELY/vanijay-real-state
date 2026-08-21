import { build } from "esbuild";

// Precache the offline page so it's available when offline
const precacheManifest = JSON.stringify([
  { url: "/offline", revision: "1" },
]);

await build({
  entryPoints: ["app/sw.ts"],
  bundle: true,
  minify: true,
  outdir: "public",
  format: "esm",
  target: "es2022",
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    "self.__SW_MANIFEST": precacheManifest,
  },
});

console.log("✅ Service worker built to public/sw.js");
