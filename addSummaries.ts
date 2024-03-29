import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import matter from "gray-matter";

const anthropic = new Anthropic({
  apiKey: process.env["ANTHROPIC_API_KEY"],
});

const examples = [
  `A method for calculating a bounding circle around a head, using facial landmarks from BlazeFace. Plus a live demo that you can run on your own face.`,
  `\`const\` is a type qualifier in C that makes a variable unassignable, except during initialization.`,
  `A C function to determine if one string is a permutation of another, using a character distribution representation for optimal time and space complexity.`,
  `To call a program from C, use \`fork\` then \`execve\`. There is no more direct way!`,
  `An efficient way to represent and sample from a discrete probability distribution, using a balanced binary tree data structure called the "urn".`,
  `The MediaStream Recording API converts a MediaStream to a Blob of compressed video and audio. A demo where you can record a 5-second clip.`,
  `A screencast about \`go tool trace\`, a profiling tool for Go applications.`,
  `How to apply a video filter to a webcam stream using the AVFoundation and CoreImage frameworks in Swift.`,
  `\`tcpdump\` captures and displays network traffic. An example inspecting DNS requests and responses.`,
  `Generating RSA keys, extracting the public key, encrypting with the public key, and decrypting with the private key.`,
  `A green screen implementation in the browser using WebGL and chroma key. Includes a live demo.`,
  `Computing a pointer to unowned memory invokes undefined behavior, even without dereferencing!`,
  `Cookies are client-side storage that get sent with every HTTP request. A cookie is scoped to a domain suffix, a path prefix, and a time range. The API is old and weird.`,
  `Installing Electron, creating an HTML web page, and writing the main entry point script to load the page.`,
];

async function fileToSummary(fileContent: string): Promise<string> {
  const message = await anthropic.messages.create({
    max_tokens: 1024,
    system:
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
      `\n` +
      examples.map((summary) => `- TL;DR: ${summary}`).join("`n"),
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
    .readdirSync("_posts")
    .filter((filename) => filename.endsWith(".md"))
    .map((filename) => `_posts/${filename}`);

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
