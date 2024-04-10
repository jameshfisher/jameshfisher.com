import { blogroll } from "../data/blogroll.js";
import { renderPage } from "../layouts/page.js";
import { fragmentHtml, h } from "../vhtml.js";

export function renderBlogroll() {
  return renderPage({
    data: {
      title: "Blogroll",
    },
    page: {
      url: "/blogroll/",
    },
    content: fragmentHtml(
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
                blog.xmlUrl ? h("a", { href: blog.xmlUrl }, "Here") : "Nope"
              ),
              h("td", {}, blog.author),
            ])
          )
        ),
      ])
    ),
  });
}
