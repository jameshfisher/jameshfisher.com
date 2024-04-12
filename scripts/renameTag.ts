import * as fs from "fs";
import matter from "gray-matter";
import { parseFrontmatter } from "../src/frontmatter";

async function main() {
  const oldTag = "ml";
  const newTag = "machine-learning";

  const filePaths = fs
    .readdirSync("_posts")
    .filter((filename) => filename.endsWith(".md"))
    .map((filename) => `_posts/${filename}`);

  for (const filePath of filePaths) {
    const fileContentWithOldTags = fs.readFileSync(filePath, "utf8");
    const { data: unparsedFrontmatter, content } = matter(
      fileContentWithOldTags,
    );
    const frontmatter = parseFrontmatter(unparsedFrontmatter);
    console.log(`Processing ${filePath}`);
    const postTagSet = new Set(frontmatter.tags ?? []);
    if (postTagSet.has(oldTag)) {
      postTagSet.delete(oldTag);
      postTagSet.add(newTag);
    }
    frontmatter.tags = [...postTagSet];
    const fileContentWithNewTags = matter.stringify(content, frontmatter);
    fs.writeFileSync(filePath, fileContentWithNewTags);
  }
}

await main();
