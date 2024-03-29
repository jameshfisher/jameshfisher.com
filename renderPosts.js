import { format } from "date-fns";
import dataPeople from "./_data/people.js";
import { renderInlineMarkdown } from "./markdown.js";
import { rawHtml } from "./rawHtml.js";
import { h } from "./vhtml.js";

export function renderPost(post) {
  return h("a", { class: "post", href: post.url }, [
    h(
      "div",
      { class: "title" },
      rawHtml(renderInlineMarkdown(post.data.title || "")),
      " ",
      post.data.external_url &&
        h("img", {
          src: "/assets/Icon_External_Link.svg",
          alt: "external link",
        }),
    ),
    h(
      "div",
      { class: "post-summary" },
      post.data.summary &&
        rawHtml(renderInlineMarkdown(post.data.summary || "")),
      " ",
      post.data.author !== "jim" &&
        h(
          "span",
          { class: "guest" },
          `Guest post by ${dataPeople[post.data.author].name}.`,
        ),
      " ",
      h("span", { class: "date" }, format(post.date, "yyyy-MM-dd")),
    ),
  ]);
}
export function renderPosts(posts) {
  return h(
    "div",
    { class: "posts no-link-underlines" },
    posts.map((post) => renderPost(post)),
  );
}
