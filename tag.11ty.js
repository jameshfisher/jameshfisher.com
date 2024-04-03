import { renderPosts } from "./renderPosts.js";
import { h } from "./vhtml.js";

export const data = {
  layout: "layouts/minimal",
  pagination: {
    data: "collections",
    size: "1",
    alias: "tagArray",
    filter: ["posts", "all"],
  },
  permalink: function (data) {
    return `/tag/${data.tagArray[0]}/`;
  },
};

function sortByDate(posts) {
  return [...posts].sort((a, b) => b.date - a.date);
}

export function render(data) {
  const tag = data.tagArray[0];
  const collection = sortByDate(
    data.collections.posts.filter((p) => (p.data.tags ?? []).includes(tag)),
  );

  return h(
    "div",
    {},
    h("h1", {}, `Tag: #${tag}`),
    renderPosts(collection),
    h("p", {}, "All content copyright James Fisher."),
  ).rawHtml;
}
