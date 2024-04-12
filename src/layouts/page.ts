import striptags from "striptags";
import { dataPeople } from "../data/people.js";
import type { Frontmatter } from "../frontmatter.js";
import { renderInlineMarkdown } from "../markdown.js";
import { navbar } from "../navbar.js";
import { scripts } from "../scripts.js";
import { h, rawHtml, type VNode } from "../vhtml.js";

function htmlToFirstParaPlaintext(rawHtml: string) {
  const firstParaMatches = rawHtml.match(/<p.*?<\/p>/s);
  if (firstParaMatches === null) return "";
  const firstParaHtml = firstParaMatches[0];
  const firstParaPlaintext = striptags(firstParaHtml);
  return firstParaPlaintext.replace(/\n/g, " ").trim();
}

export function renderPage({
  data,
  content,
  page,
}: {
  content: VNode;
  data: Frontmatter;
  page: { url: string };
}) {
  const siteUrl = "https://jameshfisher.com"; // FIXME site.url from jekyll _config.yml
  const canonical = `https://jameshfisher.com${page.url}`;

  // We don't use eleventy's 'excerpt' feature because it requires us to insert an explicit separator in the .md source.
  // I want the excerpt to just be the first paragraph, which is how it behaved in Jekyll.
  const ogDescription =
    data.summary ?? htmlToFirstParaPlaintext(content.rawHtml);

  const author = data.author || "jim";
  const authorPerson = dataPeople[author];

  const ogImageUrl = new URL(
    data.ogimage || "/assets/jim_512.jpg",
    canonical,
  ).toString();

  const html = h("html", { lang: "en" }, [
    h("head", {}, [
      h("meta", { charset: "utf-8" }),
      h("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      }),
      h("meta", { name: "theme-color", content: "white" }),
      h("meta", {
        name: "keywords",
        content: (data.tags || []).join(", "),
      }),
      h("meta", {
        property: "og:title",
        content: data.title,
      }),
      h("meta", {
        property: "og:type",
        content: "website",
      }),
      h("meta", {
        property: "og:image",
        content: ogImageUrl,
      }),
      h("meta", {
        property: "og:url",
        content: canonical,
      }),
      h("meta", {
        property: "og:description",
        content: ogDescription,
      }),
      h("meta", {
        property: "og:site_name",
        content: "jameshfisher.com",
      }),
      h("link", {
        rel: "canonical",
        href: canonical,
      }),
      h("link", {
        rel: "icon",
        type: "image/png",
        href: `${siteUrl}/assets/jim_128.png`,
      }),
      h("link", {
        rel: "alternate",
        type: "application/rss+xml",
        href: "https://jameshfisher.com/feed.xml",
      }),
      h("link", {
        rel: "stylesheet",
        href: "/assets/all.css",
      }),
      h("title", {}, [data.title]),
    ]),
    h("body", { class: "experiment-dont-show-link-summaries" }, [
      h("div", { class: "noprint", style: "float: right; overflow: hidden;" }, [
        h(
          "a",
          {
            href: "/",
            style:
              "display: block; transform: rotate(-5deg); margin: 1em -1.6em 1em 2em;",
          },
          [
            h(
              "video",
              {
                autoplay: true,
                loop: true,
                muted: true,
                playsinline: true,
                disableRemotePlayback: true,
                "x-webkit-airplay": "deny",
                disablePictureInPicture: true,
                poster: "/assets/jim_512.jpg",
                class: "jim_image",
                style: "height: 128px; object-fit: cover; padding: 5px;",
              },
              [
                h("source", {
                  src: "/assets/jim.webm",
                  type: "video/webm",
                }),
                h("source", {
                  src: "/assets/jim.mp4",
                  type: "video/mp4",
                }),
              ],
            ),
          ],
        ),
      ]),
      h("div", { id: "content" }, [
        h("h1", {}, [
          author === "jim" ? "" : "Guest post: ",
          rawHtml(renderInlineMarkdown(data.title || "")),
        ]),
        author === "jim" || !authorPerson
          ? ""
          : h("h2", {}, [
              "By ",
              h("a", { href: authorPerson.url }, [authorPerson.name]),
            ]),
        content,
        navbar,
      ]),
      scripts,
    ]),
  ]);

  return html;
}
