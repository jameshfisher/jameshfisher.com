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
- list each file in _posts
- for each that matches YYYY-MM-DD-title.md, move it to YYYY-MM-DD-title/index.md
*/

import fs from "fs";
import path from "path";

const postsDir = path.join(__dirname, "_posts");

const getChildren = (source: string) =>
  fs.readdirSync(source, { withFileTypes: true }).map((dirent) => dirent.name);

let postsDone = 0;

// For each file in posts dir
for (const post of getChildren(postsDir)) {
  const postPath = path.join(postsDir, post);
  // If it's a directory, skip
  if (fs.statSync(postPath).isDirectory()) {
    continue;
  }
  // try to match the filename with regex
  const match = post.match(/(\d{4}-\d{2}-\d{2})-(.*)\.md/);
  if (!match) {
    continue;
  }
  const [, date, title] = match;
  const newPostDir = path.join(postsDir, `${date}-${title}`);
  const newPostPath = path.join(newPostDir, "index.md");
  // create the new directory
  fs.mkdirSync(newPostDir);
  // move the file to the new directory
  fs.renameSync(postPath, newPostPath);
  postsDone++;
  break;
}
