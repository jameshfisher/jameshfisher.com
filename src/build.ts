import * as fs from "fs";
import { promises as fsPromises } from "fs";
import grayMatter from "gray-matter";
import * as path from "path";
import { renderBlogroll } from "./pages/blogroll.js";
import { renderBlogrollXml } from "./pages/blogrollXml.js";
import { renderCv } from "./pages/cv.js";
import { renderFeedXml } from "./pages/feed.js";
import { renderHomepage } from "./pages/homepage.js";
import { renderPost } from "./pages/post.js";
import { renderServiceWorker } from "./pages/serviceWorker.js";
import { renderSitemapXml } from "./pages/sitemapXml.js";
import { renderSpeaking } from "./pages/speaking.js";
import { renderTag } from "./pages/tag.js";
import type { Post, SitemapPageInfo } from "./types.js";
import { type VNode } from "./vhtml.js";

const POSTS_DIR = "_posts";
const SITE_DIR = "_site";

const ensureDir = (dir: string) => fs.mkdirSync(dir, { recursive: true });

// All HTML files are index.html. The public URL is the directory structure.
const writeHtmlIndexFile = (root: VNode, outputDir: string) => {
  ensureDir(outputDir);
  const outputPath = path.join(outputDir, "index.html");
  fs.writeFileSync(outputPath, `<!DOCTYPE html>` + root.rawHtml);
};

const getPost = async (
  sourcePostDirEnt: fs.Dirent,
): Promise<Post | undefined> => {
  if (!sourcePostDirEnt.isDirectory()) {
    return undefined;
  }
  const sourcePostDirName = sourcePostDirEnt.name;
  const match = sourcePostDirName.match(/^(\d{4})-(\d{2})-(\d{2})-(.*)$/);
  if (!match) {
    console.error(`Invalid post directory name: ${sourcePostDirName}`);
    return;
  }
  const [, year, month, day, slug] = match as [
    unknown,
    string,
    string,
    string,
    string,
  ];

  const inputDirPath = path.join(POSTS_DIR, sourcePostDirName);
  const inputFilePath = path.join(inputDirPath, "index.md");

  const sourcePostContent = await fsPromises.readFile(inputFilePath, "utf8");
  const { data, content } = grayMatter(sourcePostContent);

  const outputDirPath = path.join(SITE_DIR, year, month, day, slug);
  const outputFilePath = path.join(outputDirPath, "index.html");

  return {
    date: new Date(`${year}-${month}-${day}`),
    frontmatter: data as any,
    markdownContent: content,
    page: {
      url: `/${year}/${month}/${day}/${slug}/`,
      inputDirPath,
      inputFilePath,
      outputDirPath,
      outputFilePath,
    },
  };
};

const getPosts = async () => {
  return (
    await Promise.all(
      fs
        .readdirSync(POSTS_DIR, {
          withFileTypes: true,
        })
        .sort((a, b) => b.name.localeCompare(a.name))
        .map(getPost),
    )
  ).filter((post): post is Post => !!post);
};

function passThroughAssets(outputPath: string) {
  const match = outputPath.match(
    /_site\/(\d{4})\/(\d{2})\/(\d{2})\/(.+)\/index.html/,
  );
  if (!match) return;
  const [, year, month, day, slug] = match;
  const inputDirPath = `_posts/${year}-${month}-${day}-${slug}`;
  if (!fs.existsSync(inputDirPath)) return;

  const outputDirPath = path.dirname(outputPath);
  fs.mkdirSync(outputDirPath, { recursive: true });

  const ignorePatterns = [`index.md`, `node_modules`];
  fs.readdirSync(inputDirPath)
    .filter((filename) => !ignorePatterns.includes(filename))
    .forEach((filename) => {
      const sourcePath = path.join(inputDirPath, filename);
      const destPath = path.join(outputDirPath, filename);
      fs.cpSync(sourcePath, destPath, { recursive: true });
    });
}

export function clean() {
  if (fs.existsSync(SITE_DIR)) {
    fs.rmSync(SITE_DIR, { recursive: true, force: true });
  }
}

export async function build({ dev }: { dev: boolean }) {
  const startTime = Date.now();

  ensureDir(SITE_DIR);

  const destAssetsDir = path.join(SITE_DIR, "assets");
  if (!fs.existsSync(destAssetsDir)) {
    if (dev) {
      // copying is expensive, so symlink instead
      fs.symlinkSync("../assets", destAssetsDir);
    } else {
      // In production, copy assets instead of symlinking, because Netlify doesn't follow symlinks
      fs.mkdirSync(destAssetsDir);
      fs.cpSync("assets", destAssetsDir, { recursive: true });
    }
  }

  const sitemapEntries: SitemapPageInfo[] = [];

  const allPosts = await getPosts();
  const publishedPosts = allPosts.filter((post) => !post.frontmatter.draft);

  const tags = new Set<string>();
  // Must be all posts, not just published posts, because draft posts link to tag pages
  for (const post of allPosts) {
    for (const tag of post.frontmatter.tags || []) {
      tags.add(tag);
    }
  }

  const tagToPublishedPosts = new Map<string, Post[]>();
  for (const tag of tags) {
    tagToPublishedPosts.set(tag, []);
  }
  for (const post of publishedPosts) {
    for (const tag of post.frontmatter.tags ?? []) {
      tagToPublishedPosts.get(tag)?.push(post);
    }
  }

  for (const post of allPosts) {
    writeHtmlIndexFile(
      renderPost({ post, publishedPosts, tagToPublishedPosts }),
      post.page.outputDirPath,
    );
    passThroughAssets(post.page.outputFilePath);
    sitemapEntries.push({
      url: post.page.url,
      date: post.date,
    });
  }

  for (const [tag, publishedPostsWithTag] of tagToPublishedPosts) {
    const tagDir = path.join(SITE_DIR, "tag", tag);
    writeHtmlIndexFile(renderTag(tag, publishedPostsWithTag), tagDir);
    sitemapEntries.push({ url: `/tag/${tag}/` });
  }

  fs.writeFileSync(
    path.join(SITE_DIR, "service-worker.js"),
    renderServiceWorker(),
  );

  writeHtmlIndexFile(renderHomepage(publishedPosts), path.join(SITE_DIR));
  sitemapEntries.push({ url: "/" });

  writeHtmlIndexFile(renderCv(), path.join(SITE_DIR, "cv"));
  sitemapEntries.push({ url: "/cv/" });

  writeHtmlIndexFile(
    renderSpeaking(publishedPosts),
    path.join(SITE_DIR, "speaking"),
  );
  sitemapEntries.push({ url: "/speaking/" });

  writeHtmlIndexFile(renderBlogroll(), path.join(SITE_DIR, "blogroll"));
  sitemapEntries.push({ url: "/blogroll/" });

  fs.writeFileSync(path.join(SITE_DIR, "blogroll.xml"), renderBlogrollXml());

  fs.writeFileSync(
    path.join(SITE_DIR, "feed.xml"),
    renderFeedXml(publishedPosts),
  );

  fs.writeFileSync(
    path.join(SITE_DIR, "robots.txt"),
    "Sitemap: https://jameshfisher.com/sitemap.xml",
  );

  fs.writeFileSync(
    path.join(SITE_DIR, "sitemap.xml"),
    renderSitemapXml(sitemapEntries),
  );

  const wellKnownDir = path.join(SITE_DIR, ".well-known");
  ensureDir(wellKnownDir);
  fs.writeFileSync(
    path.join(wellKnownDir, "atproto-did"),
    "did:plc:rv2apmj25u2vaxy6y7i3pavc",
  );

  const endTime = Date.now();
  console.log(`Built site in ${endTime - startTime}ms`);
}
