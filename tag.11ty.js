import { renderPosts } from "./renderPosts.js";
import { h } from "./vhtml.js";

export const data = {
  layout: "layouts/minimal",
  pagination: {
    data: "collections",
    size: "1",
    alias: "tag",
    filter: ["posts", "all"],
  },
  permalink: function (data) {
    return `/tag/${data.tag}/`;
  },
};

export function render(data) {
  const collection = data.collections[data.tag];
  return h(
    "div",
    {},
    h("h1", {}, `Tag: #${data.tag}`),
    renderPosts(collection),
    h("p", {}, "All content copyright James Fisher."),
  );
}
