import * as fs from "fs";
import matter from "gray-matter";
import { DOMParser } from "linkedom";

type HNPost = {
  hnUrl: string; // e.g. https://news.ycombinator.com/item?id=foo
  jimUrl: string; // as in https://jameshfisher.com/YYYY/MM/DD/foo
  upvotes: number;
};

async function getHNPostsForPage(
  startUrl: string | null,
): Promise<{ posts: HNPost[]; nextPageUrl: string | null }> {
  let url =
    startUrl ?? `https://news.ycombinator.com/from?site=jameshfisher.com`;
  const res = await fetch(url);
  const text = await res.text();
  const doc = new DOMParser().parseFromString(text, "text/html");
  const rows = doc.querySelectorAll("tr.athing");
  const posts: HNPost[] = [];
  for (const row of rows) {
    const hn_id = row.id;
    const hnUrl = `https://news.ycombinator.com/item?id=${hn_id}`;
    const jimUrl = row.querySelector("td.title a")!.getAttribute("href")!;
    const upvotes = parseInt(
      row.nextElementSibling!.querySelector("span.score")!.textContent!,
    );
    posts.push({ hnUrl, jimUrl, upvotes });
  }
  const relativeNextPageUrl =
    doc.querySelector("a.morelink")?.getAttribute("href") ?? null;
  return {
    posts,
    nextPageUrl: relativeNextPageUrl
      ? `https://news.ycombinator.com/${relativeNextPageUrl}`
      : null,
  };
}

async function getHNPosts(): Promise<HNPost[]> {
  let posts: HNPost[] = [];
  let nextPageUrl: string | null = null;
  do {
    const { posts: newPosts, nextPageUrl: newNextPageUrl } =
      await getHNPostsForPage(nextPageUrl);
    posts = posts.concat(newPosts);
    nextPageUrl = newNextPageUrl;
  } while (nextPageUrl);
  return posts;
}

async function main() {
  const hnPosts = await getHNPosts();

  const jimUrlToMostUpvotedHnPost: Record<string, HNPost> = {};

  for (const hnPost of hnPosts) {
    const jimUrl = hnPost.jimUrl;
    const jimPost = jimUrlToMostUpvotedHnPost[jimUrl];
    if (!jimPost || hnPost.upvotes > jimPost.upvotes) {
      jimUrlToMostUpvotedHnPost[jimUrl] = {
        jimUrl: jimUrl,
        hnUrl: hnPost.hnUrl,
        upvotes: hnPost.upvotes,
      };
    }
  }

  for (const jimPost of Object.values(jimUrlToMostUpvotedHnPost)) {
    const url = new URL(jimPost.jimUrl);

    const pathname = url.pathname;
    // Don't include trailing .html, if present, or a trailing slash
    const match = pathname.match(
      /\/(\d{4})\/(\d{2})\/(\d{2})\/(.+?)\/?(\.html|\/)?$/,
    );
    if (!match) {
      console.warn(`Failed to match ${pathname}`);
      continue;
    }
    const [, year, month, day, title] = match;

    // Now we can read the file, add the frontmatter, and write it back
    const filename = `_posts/${year}-${month}-${day}-${title}.md`;
    // to read in node, we need to use fs
    const text = fs.readFileSync(filename, "utf8");

    const { data, content } = matter(text);
    data.hnUrl = jimPost.hnUrl;
    data.hnUpvotes = jimPost.upvotes;
    const newText = matter.stringify(content, data);

    fs.writeFileSync(filename, newText, "utf8");
  }
}

await main();
