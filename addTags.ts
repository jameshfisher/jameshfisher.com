import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import matter from "gray-matter";

const anthropic = new Anthropic({
  apiKey: process.env["ANTHROPIC_API_KEY"],
});

const exampleFileContent = `
---
title: "What is \`ssize_t\` in C?"
---

Lots of C functions use a type called \`ssize_t\`. What's that? What is the extra \`s\`? In short, \`ssize_t\` is the same as \`size_t\`, but is a signed type - read \`ssize_t\` as "signed \`size_t\`".
`;
const exampleTags = ["size_t", "posix", "c", "programming"];

async function fileToTags(
  fileContentWithoutTags: string,
  tagVocab: Set<string>,
): Promise<string[]> {
  const message = await anthropic.messages.create({
    max_tokens: 128,
    system: [
      `You are given a blog post from jameshfisher.com.`,
      `You respond with a string like "Tags: foo, bar".`,
      `Tags are used to recommend similar posts, and to allow browsing by topic.`,
      `Use existing tags where possible, which are: \`${[...tagVocab].join(", ")}\`.`,
      `If the post covers any topics that do not yet have tags, invent new tags.`,
      `Start with specific keywords, and work up to more general topics.`,
    ].join(" "),
    messages: [
      { role: "user", content: exampleFileContent },
      { role: "assistant", content: `Tags: ${exampleTags.join(", ")}` },
      { role: "user", content: fileContentWithoutTags.slice(0, 2048) },
      { role: "assistant", content: `Tags:` },
    ],
    model: "claude-3-haiku-20240307",
  });
  console.log({ message });
  const content = message.content;
  const contentBlock = content[0];
  const responseText = contentBlock.text;
  return responseText.split(",").map((tag) => tag.trim());
}

async function getTagVocab(filePaths: string[]): Promise<Set<string>> {
  const tagSet = new Set<string>();
  for (const filePath of filePaths) {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const { data: postFrontmatter } = matter(fileContent);
    const tags = postFrontmatter.tags ?? [];
    for (const tag of tags) {
      tagSet.add(tag);
    }
  }
  return tagSet;
}

async function main() {
  const dateStr = new Date().toISOString().slice(0, 10);

  const filePaths = fs
    .readdirSync("_posts")
    .filter((filename) => filename.endsWith(".md"))
    .map((filename) => `_posts/${filename}`)
    .sort((a, b) => a.localeCompare(b));

  const globalTagVocab = await getTagVocab(filePaths);
  console.log(`Tag vocab: ${[...globalTagVocab].join(", ")}`);

  for (const filePath of filePaths) {
    console.log(`Processing ${filePath}`);
    const fileContentWithOldTags = fs.readFileSync(filePath, "utf8");
    const { data: postFrontmatter, content } = matter(fileContentWithOldTags);
    if (postFrontmatter.taggedAt) {
      console.log(`Already tagged; skipping`);
      continue;
    }
    const postTagSet = new Set(postFrontmatter.tags ?? []);
    delete postFrontmatter.tags;
    const fileContentWithoutTags = matter.stringify(content, postFrontmatter);
    const newTags = await fileToTags(fileContentWithoutTags, globalTagVocab);
    for (const tag of newTags) {
      if (!globalTagVocab.has(tag)) {
        console.log(`New global tag: ${tag}`);
      }
      globalTagVocab.add(tag);
    }
    for (const tag of newTags) postTagSet.add(tag);
    postFrontmatter.tags = [...postTagSet];
    postFrontmatter.taggedAt = dateStr;
    const fileContentWithNewTags = matter.stringify(content, postFrontmatter);
    fs.writeFileSync(filePath, fileContentWithNewTags);
    return;
  }
}

await main();
