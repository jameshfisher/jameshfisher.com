import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import matter from "gray-matter";

const anthropic = new Anthropic({
  apiKey: process.env["ANTHROPIC_API_KEY"],
});

const examples = [
  `A primary feature of a collaborative product is its social norms. I look at LessWrong, a forum product, and show it builds its social norms.`,
  `I try \`vim\`, but give up after finding the cursor cannot sit at the end of a line.`,
  `A method for calculating a bounding circle around a head, using facial landmarks from BlazeFace. Plus a live demo that you can run on your own face.`,
  `\`const\` is a type qualifier in C that makes a variable unassignable, except during initialization.`,
  `A C function to determine if one string is a permutation of
  another, using a character distribution representation for optimal time and space complexity.`,
  `To call a program from C, use \`fork\` then \`execve\`. There is no more direct way!`,
  `An efficient way to represent and sample from a discrete
  probability distribution, using a balanced binary tree data structure called the "urn".`,
  `Creating and using an SSH certificate authority, an alternative to the default "trust on first use" model.`,
  `The MediaStream Recording API converts a MediaStream to a Blob of compressed video and audio. A demo where you can record a 5-second clip.`,
  `A screencast about \`go tool trace\`, a profiling tool for Go applications.`,
  `How to apply a video filter to a webcam stream using the AVFoundation and CoreImage frameworks in Swift.`,
  `\`tcpdump\` captures and displays network traffic. An example inspecting DNS requests and responses.`,
  `Generating RSA keys, extracting the public key, encrypting with the public key, and
  decrypting with the private key.`,
];

async function fileToSummary(fileContent: string): Promise<string> {
  const message = await anthropic.messages.create({
    max_tokens: 1024,
    system:
      [
        `You are given an excerpt of a post from jameshfisher.com, Jim Fisher's blog.`,
        `You respond with a summary of 20 words or less.`,
        `The summary will be added to the post front-matter.`,
        `The summary is shown beneath links to the post.`,
        `Write as Jim Fisher, using 'I' and 'we'.`,
        `Summarize the content directly, and do not mention 'the post'.`,
        `Be extremely concise, even using sentence fragments.`,
        `Only include information from the post.`,
        `Use Markdown for formatting.`,
        `Excellent examples of summaries from other posts:`,
      ].join(" ") +
      `\n` +
      examples.map((summary) => `- Summary: ${summary}`).join("`n"),
    messages: [
      { role: "user", content: fileContent.slice(0, 16384) },
      { role: "assistant", content: `Summary:` },
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
    if (i >= 8) return;
  }
}

await main();
