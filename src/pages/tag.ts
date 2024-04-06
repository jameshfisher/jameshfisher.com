import { renderPosts } from "../renderPosts";
import type { Post } from "../types";
import { h } from "../vhtml";
import { renderPage } from "../layouts/page";
import { sortByDate } from "../sortByDate";

export function renderTag(tag: string, posts: Post[]) {
  const collection = sortByDate(
    posts.filter((p) => (p.frontmatter.tags ?? []).includes(tag))
  );
  return renderPage({
    content: h(
      "div",
      {},
      renderPosts(collection),
      h("p", {}, "All content copyright James Fisher.")
    ),
    data: { title: `Tag: #${tag}` },
    page: { url: `/tag/${tag}/` },
  });
}
