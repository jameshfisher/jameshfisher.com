import { format } from "date-fns";
import type { Frontmatter } from "../frontmatter";
import { renderPage } from "../layouts/page";
import { liquidMarkdownToHtml } from "../liquidMarkdown";
import { renderPosts } from "../renderPosts";
import { sortByDate } from "../sortByDate";
import type { Post } from "../types";
import { fragmentHtml, h, rawHtml, type VChild, type VNode } from "../vhtml";

function tagSpecificity({
  tag,
  publishedPosts,
  tagToPublishedPosts,
}: {
  tag: string;
  publishedPosts: Post[];
  tagToPublishedPosts: Map<string, Post[]>;
}) {
  const numPostsWithTag = (tagToPublishedPosts.get(tag) ?? []).length;
  const numPosts = publishedPosts.length;
  const frac = numPostsWithTag / numPosts;
  return Math.log(1 / frac);
}

function tagSetSize({
  tags,
  publishedPosts,
  tagToPublishedPosts,
}: {
  tags: Set<string>;
  publishedPosts: Post[];
  tagToPublishedPosts: Map<string, Post[]>;
}) {
  let size = 0;
  for (const tag of tags) {
    size += tagSpecificity({ tag, tagToPublishedPosts, publishedPosts });
  }
  return size;
}

function postSimilarityTFIDF({
  post1Data,
  post2Data,
  publishedPosts,
  tagToPublishedPosts,
}: {
  post1Data: Frontmatter;
  post2Data: Frontmatter;
  publishedPosts: Post[];
  tagToPublishedPosts: Map<string, Post[]>;
}) {
  const tags1 = new Set(post1Data.tags || []);
  const tags2 = new Set(post2Data.tags || []);
  const intersection = new Set([...tags1].filter((x) => tags2.has(x)));
  const union = new Set([...tags1, ...tags2]);

  const intersectionSize = tagSetSize({
    tags: intersection,
    publishedPosts,
    tagToPublishedPosts,
  });
  const unionSize = tagSetSize({
    tags: union,
    publishedPosts,
    tagToPublishedPosts,
  });

  return intersectionSize / unionSize;
}

// A/B test showed that TF-IDF leads to more clicks than Jaccard similarity
function similarPublishedPostsTFIDF({
  post,
  publishedPosts,
  tagToPublishedPosts,
}: {
  post: Post;
  publishedPosts: Post[];
  tagToPublishedPosts: Map<string, Post[]>;
}) {
  return publishedPosts
    .filter((p) => p.markdownContent !== post.markdownContent)
    .map((p) => ({
      post: p,
      similarity: postSimilarityTFIDF({
        post1Data: post.frontmatter,
        post2Data: p.frontmatter,
        publishedPosts,
        tagToPublishedPosts,
      }),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 6)
    .map((x) => x.post);
}

const recruitingMailtoURL = new URL("mailto:team@granola.so");
recruitingMailtoURL.searchParams.append("subject", "Let's work together!");
recruitingMailtoURL.searchParams.append("body", "Hey team,\n\n");

const recruitingElement: VChild = h(
  "div",
  {
    style:
      "background: #ffeb57; border-radius: 0.5em; margin-top: 1em; margin-bottom: 1em; padding: 1em;",
  },
  [
    h("div", {}, [
      "Want to build a fantastic product using LLMs? I work at ",
      h(
        "strong",
        {},
        h("a", { href: "https://granola.so", target: "_blank" }, "Granola"),
      ),
      " where we're building the future IDE for knowledge work. Come and work with us! ",
      h(
        "a",
        { href: "https://jobs.granola.so/", target: "_blank" },
        "Read more",
      ),
      " or ",
      h("strong", {}, [
        h(
          "a",
          {
            href: recruitingMailtoURL.href,
          },
          "get in touch!",
        ),
      ]),
    ]),
  ],
);

export function renderPost({
  post,
  publishedPosts,
  tagToPublishedPosts,
}: {
  post: Post;
  publishedPosts: Post[];
  tagToPublishedPosts: Map<string, Post[]>;
}): VNode {
  const { frontmatter } = post;

  const author = frontmatter.author || "jim";

  const allPosts = sortByDate(publishedPosts);
  const myFavoritePosts = allPosts.filter((post) =>
    (post.frontmatter.tags ?? []).includes("fave"),
  );

  const contentHtml = liquidMarkdownToHtml(post.markdownContent);

  return renderPage({
    content: fragmentHtml([
      frontmatter.external_url
        ? fragmentHtml([
            h("p", {}, [
              h("strong", {}, [
                h("a", { href: frontmatter.external_url }, [
                  `This post is published externally at ${frontmatter.external_url}`,
                  h("img", {
                    src: "/assets/Icon_External_Link.svg",
                    alt: "external link",
                  }),
                  ".",
                ]),
              ]),
            ]),
          ])
        : "",
      rawHtml(contentHtml),

      h("div", { class: "noprint" }, [
        frontmatter.hnUrl
          ? h("div", {}, [
              h("a", { href: frontmatter.hnUrl, target: "_blank" }, [
                "Discussion on Hacker News.",
              ]),
            ])
          : "",
        h("div", {}, [
          "Tagged ",
          ...(frontmatter.tags ?? []).map((tag, i) =>
            fragmentHtml([
              i ? ", " : undefined,
              h("a", { class: "post", href: `/tag/${tag}` }, [`#${tag}`]),
            ]),
          ),
          ".",
        ]),
        h("h3", { style: "margin-top: 4em;" }, "Similar posts"),
        renderPosts(
          similarPublishedPostsTFIDF({
            post,
            publishedPosts,
            tagToPublishedPosts,
          }),
        ),
        h("h3", {}, "More by Jim"),
        renderPosts(myFavoritePosts),
        recruitingElement,
      ]),
      h("p", {}, [
        author === "jim"
          ? ` This page copyright James Fisher ${format(
              post.date,
              "yyyy",
            )}. Content is not associated with my employer.`
          : "",
        h("span", { class: "noprint" }, [
          " ",
          h(
            "a",
            {
              href: new URL(
                post.page.inputFilePath,
                "https://github.com/jameshfisher/jameshfisher.com/edit/master/",
              ).href,
            },
            "Found an error? Edit this page.",
          ),
        ]),
      ]),
    ]),
    data: post.frontmatter,
    page: post.page,
  });
}
