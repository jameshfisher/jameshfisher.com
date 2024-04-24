import { format } from "date-fns";
import type { Frontmatter } from "../frontmatter";
import { renderPage } from "../layouts/page";
import { liquidMarkdownToHtml } from "../liquidMarkdown";
import { renderPosts } from "../renderPosts";
import { sortByDate } from "../sortByDate";
import type { Post } from "../types";
import { fragmentHtml, h, rawHtml, type VNode } from "../vhtml";

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
        h("h3", {}, "Similar posts"),
        renderPosts(
          similarPublishedPostsTFIDF({
            post,
            publishedPosts,
            tagToPublishedPosts,
          }),
        ),
        h("h3", {}, "More by Jim"),
        renderPosts(myFavoritePosts),
        h(
          "div",
          {
            style:
              "background: #ffeb57; border-radius: 0.5em; margin-top: 1em; margin-bottom: 1em; padding: 1em;",
          },
          [
            h("div", {}, [
              "👋 I'm Jim, a ",
              h("strong", {}, "full-stack product engineer."),
              " Want to build an ",
              h("strong", {}, "amazing product"),
              " and a ",
              h("strong", {}, "profitable business?"),
              " ",
              h("a", { href: "/cv" }, "Read more about me"),
              " or ",
              h("strong", {}, [
                h(
                  "a",
                  {
                    href: "mailto:jameshfisher+work@gmail.com?subject=Let%27s%20build%20an%20amazing%20product%21&body=Hey%20Jim%2C%0A%0A",
                  },
                  "Get in touch!",
                ),
              ]),
            ]),
          ],
        ),
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
