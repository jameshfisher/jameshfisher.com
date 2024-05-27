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

await build({ dev: true });

const watcher = bs.watch("_posts");
watcher.on("change", async (file) => {
  console.log(`File changed: ${file}`);
  await build({ dev: true });
});
