import { format } from "date-fns";
import { renderPage } from "../layouts/page";
import { renderInlineMarkdown } from "../markdown";
import { liquidMarkdownToHtml } from "../liquidMarkdown";
import type { Post } from "../types";
import { fragmentHtml, h, rawHtml } from "../vhtml";

export function renderSpeaking(posts: Post[]) {
  return renderPage({
    data: {
      title: "Talks",
    },
    page: {
      url: "/speaking/",
    },
    content: fragmentHtml(
      h("p", {}, "I've given some talks at conferences and meetups."),
      h(
        "p",
        {},
        "If you'd like me to talk at your event, ",
        h("a", { href: "mailto:jameshfisher@gmail.com" }, "let me know"),
        "."
      ),
      h(
        "p",
        {},
        "I've also made a few screencasts, some of which were preparations for talks and conferences."
      ),
      ...posts
        .filter((post) => (post.frontmatter.tags ?? []).includes("talk"))
        .map((post) =>
          fragmentHtml(
            h(
              "h2",
              {},
              h("a", { href: post.page.url }, [
                format(post.date, "yyyy-MM-dd"),
                ": ",
                rawHtml(renderInlineMarkdown(post.frontmatter.title)),
              ])
            ),
            h("div", {}, rawHtml(liquidMarkdownToHtml(post.markdownContent)))
          )
        )
    ),
  });
}
