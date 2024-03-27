import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import matter from "gray-matter";

const anthropic = new Anthropic({
  apiKey: process.env["ANTHROPIC_API_KEY"],
});

const examples = [
  `Redis Sentinel provides high availability for Redis. We start a Redis
master, then three Redis Sentinel instances. They discover each other, then we trigger a failover.`,
  `A primary feature of a collaborative product is its social norms. I look at LessWrong, a forum product, and show it builds its unique social norms.`,
];

async function fileToSummary(fileContent: string): Promise<string> {
  const message = await anthropic.messages.create({
    max_tokens: 1024,
    system:
      [
        `You are given an excerpt of a post from jameshfisher.com, Jim Fisher's blog.`,
        `You respond with a summary of 30 words or less.`,
        `The summary will be added to the post front-matter.`,
        `The summary is shown beneath links to the post.`,
        `Write as Jim Fisher, using 'I' and 'we'.`,
        `Summarize the post directly, and do not mention 'the post'.`,
        `Only include information from the post.`,
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
    if (postFrontmatter.summary) {
      continue;
    }
    console.log(`Processing ${filePath}`);
    const summaryString = await fileToSummary(fileContent);
    postFrontmatter.summary = summaryString;
    const newFileContent = matter.stringify(content, postFrontmatter);
    fs.writeFileSync(filePath, newFileContent);
    i++;
    if (i >= 1) return;
  }
}

await main();
