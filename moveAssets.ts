/*
We currently have:
_posts/YYYY-MM-DD-title.md
and
assets/YYYY-MM-DD-sometimes-a-title/foobar.png etc

We want to move the assets to the same folder as the post
We will create post-specific folders for the assets like
_posts/YYYY-MM-DD-title/index.md
which will also contain the assets like
_posts/YYYY-MM-DD-title/foobar.png

This script will
- list each folder in assets, starting with most recent
- for each folder, extract the date, and find the corresponding post file in _posts
- create a folder in _posts with the same name as the post file
- move the post file to the new folder and rename it to index.md
- move all the files from the assets folder to the new folder
- update links in the post file to point to the new location of the assets, using relative paths
*/

import fs from "fs";
import path from "path";

const assetsDir = path.join(__dirname, "assets");
const postsDir = path.join(__dirname, "_posts");

const getDirectories = (source: string) =>
  fs
    .readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

const getChildren = (source: string) =>
  fs.readdirSync(source, { withFileTypes: true }).map((dirent) => dirent.name);

// Get all directories in assets, sorted by date
const assetDirs = getDirectories(assetsDir).sort().reverse();

let postsDone = 0;

// For each directory in assets
for (const assetDir of assetDirs) {
  // Extract the date from the directory name with regex
  const date = assetDir.match(/^\d{4}-\d{2}-\d{2}/)?.[0];

  if (!date) {
    console.log(`No date found for ${assetDir}`);
    continue;
  }

  console.log(`Processing ${assetDir}`);

  // Find the corresponding post files in _posts
  // If there are multiple posts for the same date, skip
  const postFiles = fs
    .readdirSync(postsDir)
    .filter((file) => file.startsWith(date));

  if (postFiles.length === 0) {
    console.log(`No post found for ${date}`);
    continue;
  } else if (postFiles.length > 1) {
    console.log(`Multiple posts found for ${date}`);
    continue;
  }

  const postFile = postFiles[0];
  console.log(`Found post ${postFile}`);

  // // Create a folder in _posts with the same name as the post file, but without the extension
  const newPostDir = path.join(postsDir, postFile.replace(/\.md$/, ""));
  // If the folder already exists, skip
  if (fs.existsSync(newPostDir)) {
    console.log(`Folder already exists for ${postFile}`);
    continue;
  }

  fs.mkdirSync(newPostDir);

  // Move the post file to the new folder and rename it to index.md
  fs.renameSync(
    path.join(postsDir, postFile),
    path.join(newPostDir, "index.md"),
  );

  // Move all the files from the assets folder to the new folder
  const assetFiles = getChildren(path.join(assetsDir, assetDir));
  for (const assetFile of assetFiles) {
    fs.renameSync(
      path.join(assetsDir, assetDir, assetFile),
      path.join(newPostDir, assetFile),
    );
  }

  // Update links in the post file to point to the new location of the assets
  // Original strings will look like  "/assets/YYYY-MM-DD/" or "/assets/YYYY-MM-DD-something/"
  // Updated strings will look like "./"

  const postContent = fs.readFileSync(
    path.join(newPostDir, "index.md"),
    "utf8",
  );
  const updatedContent = postContent.replace(
    /\/assets\/\d{4}-\d{2}-\d{2}[^/]*\//g,
    "./",
  );
  fs.writeFileSync(path.join(newPostDir, "index.md"), updatedContent);

  postsDone += 1;
  if (postsDone >= 0) {
    break;
  }
}
