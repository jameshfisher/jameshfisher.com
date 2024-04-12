import * as fs from "fs";
import matter from "gray-matter";

async function main() {
  const oldTag = "ml";
  const newTag = "machine-learning";

  const filePaths = fs
    .readdirSync("_posts")
    .filter((filename) => filename.endsWith(".md"))
    .map((filename) => `_posts/${filename}`);

  for (const filePath of filePaths) {
    const fileContentWithOldTags = fs.readFileSync(filePath, "utf8");
    const { data: postFrontmatter, content } = matter(fileContentWithOldTags);
    console.log(`Processing ${filePath}`);
    const postTagSet = new Set(postFrontmatter.tags ?? []);
    if (postTagSet.has(oldTag)) {
      postTagSet.delete(oldTag);
      postTagSet.add(newTag);
    }
    postFrontmatter.tags = [...postTagSet];
    const fileContentWithNewTags = matter.stringify(content, postFrontmatter);
    fs.writeFileSync(filePath, fileContentWithNewTags);
  }
}

await main();
