// A static site generator.
// This is the only file.
// Content is in _posts/YYYY-MM-DD/slug/index.md
// Destination is _site/YYYY/MM/DD/slug/index.html
// Dev server is at http://localhost:8080

import browserSync from "browser-sync";
import { build } from "./src/build.js";

const PORT = 8080;
const SITE_DIR = "_site";

const bs = browserSync.create();
bs.init({ port: PORT, server: SITE_DIR });
bs.watch(SITE_DIR).on("change", bs.reload);

await build();

bs.watch("_posts").on("change", async () => {
  await build();
});
