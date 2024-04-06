import { format } from "date-fns";
import { dataPeople } from "./data/people.js";
import { renderInlineMarkdown } from "./markdown.js";
import type { Post } from "./types.js";
import { h, rawHtml } from "./vhtml.js";

export function renderPost(post: Post) {
  return h(
    "a",
    {
      class: "post",
      href: post.frontmatter.external_url ?? post.page.url,
      target: post.frontmatter.external_url ? "_blank" : undefined,
    },
    [
      h(
        "div",
        { class: "title" },
        rawHtml(renderInlineMarkdown(post.frontmatter.title || "")),
        " ",
        post.frontmatter.external_url &&
          h("img", {
            src: "/assets/Icon_External_Link.svg",
            alt: "external link",
          })
      ),
      h(
        "div",
        { class: "post-summary" },
        post.frontmatter.summary &&
          rawHtml(renderInlineMarkdown(post.frontmatter.summary || "")),
        " ",
        post.frontmatter.author &&
          post.frontmatter.author !== "jim" &&
          h(
            "span",
            { class: "guest" },
            `Guest post by ${dataPeople[post.frontmatter.author]!.name}.`
          ),
        " ",
        h("span", { class: "date" }, format(post.date, "yyyy-MM-dd"))
      ),
    ]
  );
}

export function renderPosts(posts: Post[]) {
  return h(
    "div",
    { class: "posts no-link-underlines" },
    posts.map((post) => renderPost(post))
  );
}
