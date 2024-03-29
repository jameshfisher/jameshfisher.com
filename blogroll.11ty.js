import blogroll from "./blogroll.js";
import { fragmentHtml } from "./fragmentHtml.js";
import { h } from "./vhtml.js";

export const data = {
  layout: "layouts/minimal",
  author: "jim",
  title: "Blogroll",
};

export function render(data) {
  return fragmentHtml(
    h("p", {}, [
      "This blogroll is also available as ",
      h("a", { href: "/blogroll.xml" }, "an OPML file"),
      ", which is accepted by many RSS readers.",
    ]),
    h("table", {}, [
      h("thead", {}, [
        h("tr", {}, [
          h("th", {}, "Blog"),
          h("th", {}, "RSS"),
          h("th", {}, "Author"),
        ]),
      ]),
      h(
        "tbody",
        {},
        blogroll.map((blog) =>
          h("tr", {}, [
            h("td", {}, h("a", { href: blog.htmlUrl }, blog.title)),
            h(
              "td",
              {},
              blog.xmlUrl ? h("a", { href: blog.xmlUrl }, "Here") : "Nope",
            ),
            h("td", {}, blog.author),
          ]),
        ),
      ),
    ]),
  ).rawHtml;
}
