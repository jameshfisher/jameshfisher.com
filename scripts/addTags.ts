import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import {
  parsePostFileContent,
  stringifyPostFileContent,
} from "../src/frontmatter";

const anthropic = new Anthropic({
  apiKey: process.env["ANTHROPIC_API_KEY"],
});

type Example = { fileContentWithoutTags: string; tags: string[] };

const examples: Example[] = [
  {
    fileContentWithoutTags: `---
  title: "What is \`ssize_t\` in C?"
  ---

  Lots of C functions use a type called \`ssize_t\`. What's that? What is the extra \`s\`? In short, \`ssize_t\` is the same as \`size_t\`, but is a signed type - read \`ssize_t\` as "signed \`size_t\`".
  `,
    tags: ["size_t", "c", "posix", "programming"],
  },
  {
    fileContentWithoutTags: `---
title: Don't use the word 'simply'
---

Take these examples:

> One approach is simply to compress the messages.

> Simply link in the CDN and get started.

All of these sentences are improved by removing the word "simply".`,
    tags: ["simply", "technical-writing", "writing", "communication", "essay"],
  },
];

async function fileToTags(
  fileContentWithoutTags: string,
  tagVocab: Set<string>,
): Promise<string[]> {
  const vocabList = [...tagVocab];
  vocabList.sort((a, b) => a.localeCompare(b));
  const message = await anthropic.messages.create({
    max_tokens: 128,
    system: [
      `You are given an excerpt of a post from jameshfisher.com, Jim Fisher's blog.`,
      `You respond with a string like "Tags: foo, bar".`,
      `The tags will be added to the post front-matter.`,
      `Tags are used to recommend similar posts, and to allow browsing by topic.`,
      `Use existing tags where possible, which are: \`${vocabList.join(", ")}\`.`,
      `If the post covers any topics that do not yet have tags, invent new tags.`,
      `The first tags should be the specific topics of the post.`,
      `The remaining tags are more general topics.`,
    ].join(" "),
    messages: [
      ...examples.flatMap(
        (example) =>
          [
            { role: "user", content: example.fileContentWithoutTags },
            { role: "assistant", content: `Tags: ${example.tags.join(", ")}` },
          ] as const,
      ),
      { role: "user", content: fileContentWithoutTags.slice(0, 2048) },
      { role: "assistant", content: `Tags:` },
    ],
    model: "claude-3-haiku-20240307",
  });
  console.log({ message });
  const content = message.content;
  const contentBlock = content[0]!;
  const responseText = contentBlock.text;
  return responseText.split(",").map((tag) => tag.trim());
}

async function getTagVocab(filePaths: string[]): Promise<Set<string>> {
  const tagSet = new Set<string>();
  for (const filePath of filePaths) {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const { frontmatter } = parsePostFileContent(fileContent);
    const tags = frontmatter.tags ?? [];
    for (const tag of tags) {
      tagSet.add(tag);
    }
  }
  return tagSet;
}

function shuffle<T>(array: T[]): void {
  // Fisher-Yates shuffle
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j]!, array[i]!];
  }
}

async function main() {
  const dateStr = new Date().toISOString().slice(0, 10);

  const filePaths = fs
    .readdirSync("_posts", { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => `_posts/${dirent.name}/index.md`)
    .filter((filePath) => fs.existsSync(filePath));

  shuffle(filePaths);

  const globalTagVocab = await getTagVocab(filePaths);
  const initialVocabList = [...globalTagVocab];
  initialVocabList.sort((a, b) => a.localeCompare(b));
  console.log(`Tag vocab: ${initialVocabList.join(", ")}`);

  let i = 0;
  for (const filePath of filePaths) {
    const fileContentWithOldTags = fs.readFileSync(filePath, "utf8");
    const { content, frontmatter } = parsePostFileContent(
      fileContentWithOldTags,
    );
    if (frontmatter.taggedAt) {
      continue;
    }
    console.log(`Processing ${filePath}`);
    const postTagSet = new Set(frontmatter.tags ?? []);
    const frontmatterWithoutTags = { ...frontmatter };
    delete frontmatterWithoutTags.tags;
    const fileContentWithoutTags = stringifyPostFileContent({
      frontmatter: frontmatterWithoutTags,
      content,
    });
    const newTags = await fileToTags(fileContentWithoutTags, globalTagVocab);
    for (const tag of newTags) {
      if (!globalTagVocab.has(tag)) {
        console.log(`New global tag: ${tag}`);
      }
      globalTagVocab.add(tag);
    }
    for (const tag of newTags) postTagSet.add(tag);
    frontmatter.tags = [...postTagSet];
    frontmatter.taggedAt = dateStr;
    const fileContentWithNewTags = stringifyPostFileContent({
      frontmatter,
      content,
    });
    fs.writeFileSync(filePath, fileContentWithNewTags);
    i++;
    if (i >= 8) return;
  }
}

await main();
