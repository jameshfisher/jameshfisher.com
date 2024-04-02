import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import matter from "gray-matter";

const anthropic = new Anthropic({
  apiKey: process.env["ANTHROPIC_API_KEY"],
});

const examples = [
  {
    title: "Head tracking with BlazeFace",
    summary: `Calculating a bounding circle around a head, using facial landmarks from BlazeFace. Includes a demo that you can run on your own face.`,
  },
  {
    title: "What does `const` mean in C?",
    summary: `\`const\` is a type qualifier in C that makes a variable unassignable, except during initialization.`,
  },
  {
    title: "Determine whether one string is a permutation of the other",
    summary: `A C function to identify a permutation, using a character distribution representation for optimal time and space complexity.`,
  },
  {
    title: "How do I call a program from C?",
    summary: `To call a program from C, use \`fork\` then \`execve\`. There is no more direct way!`,
  },
  {
    title: "ICFP: Ode on a Random Urn",
    summary: `Representing and sampling from a discrete probability distribution, using a balanced binary tree data structure called the "urn".`,
  },
  {
    title: "MediaRecorder hello world",
    summary: `The MediaStream Recording API converts a MediaStream to a Blob of compressed video and audio. Includes a demo where you can record a 5-second clip.`,
  },
  {
    title: "How to run `go tool trace`",
    summary: `A screencast about \`go tool trace\`, a profiling tool for Go applications.`,
  },
  {
    title: "What is `tcpdump`?",
    summary: `\`tcpdump\` captures and displays network traffic. An example inspecting DNS requests and responses.`,
  },
  {
    title: "Does C allow pointer arithmetic?",
    summary: `Computing a pointer to unowned memory invokes undefined behavior, even without dereferencing!`,
  },
  {
    title: "Auto-summarizing blog posts",
    summary:
      "Summarizing my blog posts using Claude Haiku. The benefits of providing business context. The benefits of iterating.",
  },
];

async function fileToSummary(fileContent: string): Promise<string> {
  const systemPrompt =
    [
      `You are given an excerpt of a post from jameshfisher.com, Jim Fisher's blog.`,
      `You respond with a TL;DR of 1 or 2 sentences.`,
      `The TL;DR will be added to the post front-matter.`,
      `The TL;DR is shown beneath links to the post.`,
      `You are Jim Fisher, and write using the style and vocabulary of the examples and the post.`,
      `Paraphrase the content directly.`,
      `Never mention 'the post'.`,
      `Be extremely concise, even using sentence fragments.`,
      `Do not duplicate info from the title.`,
      `Only include information from the post.`,
      `Use Markdown for formatting.`,
      `Excellent examples of TL;DRs from other posts:`,
    ].join(" ") +
    `\n\n` +
    examples
      .map(({ title, summary }) => `Title: ${title}\nTL;DR: ${summary}`)
      .join("\n\n");
  console.log({ systemPrompt });
  const message = await anthropic.messages.create({
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      { role: "user", content: fileContent.slice(0, 16384) },
      { role: "assistant", content: `TL;DR:` },
    ],
    model: "claude-3-haiku-20240307",
  });
  console.log({ message });
  const content = message.content;
  const contentBlock = content[0];
  return contentBlock.text.trim();
}

function shuffle<T>(array: T[]): void {
  // Fisher-Yates shuffle
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function main() {
  const filePaths = fs
    .readdirSync("_posts", { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => `_posts/${dirent.name}/index.md`)
    .filter((filePath) => fs.existsSync(filePath));

  shuffle(filePaths);

  let i = 0;
  for (const filePath of filePaths) {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const { data: postFrontmatter, content } = matter(fileContent);
    if (
      postFrontmatter.summary ||
      postFrontmatter.external_url ||
      postFrontmatter.draft
    ) {
      continue;
    }
    console.log(`Processing ${filePath}`);
    const summaryString = await fileToSummary(fileContent);
    postFrontmatter.summary = summaryString;
    const newFileContent = matter.stringify(content, postFrontmatter);
    fs.writeFileSync(filePath, newFileContent);
    i++;
    if (i >= 32) return;
  }

  console.log("Done!");
}

await main();
