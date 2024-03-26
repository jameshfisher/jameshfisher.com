import h from "vhtml";
import navbarHtml from "./navbar.js";
import { rawHtml } from "./rawHtml.js";
import renderTitle from "./renderTitle.js";
import scriptsHtml from "./scripts.js";

export const data = {
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

  const title = `Tag: ${data.tag}`;

  const siteUrl = "https://jameshfisher.com"; // FIXME site.url from jekyll _config.yml
  const canonical = `https://jameshfisher.com${data.page.url}`;

  return h("html", { lang: "en" }, [
    h("head", {}, [
      h("meta", { charset: "utf-8" }),
      h("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      }),
      h("meta", { name: "theme-color", content: "white" }),
      h("meta", { property: "og:title", content: title }),
      h("meta", { property: "og:type", content: "website" }),
      h("meta", {
        property: "og:image",
        content: `${siteUrl}${data.ogimage || "/assets/jim_512.jpg"}`,
      }),
      h("meta", { property: "og:url", content: canonical }),
      h("meta", { property: "og:site_name", content: "jameshfisher.com" }),
      h("link", { rel: "canonical", href: canonical }),
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
      h("link", { rel: "stylesheet", href: "/assets/all.css" }),
      h("title", {}, title),
    ]),
    h("body", {}, [
      h(
        "a",
        {
          href: "/",
          style:
            "display: block; transform: rotate(-5deg); margin: 0 2em 0 -1.6em; float: left;",
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
              h("source", { src: "/assets/jim.webm", type: "video/webm" }),
              h("source", { src: "/assets/jim.mp4", type: "video/mp4" }),
            ],
          ),
        ],
      ),
      h("div", { id: "content" }, [
        h("h1", {}, `Tag: #${data.tag}`),
        h(
          "ul",
          {},
          collection.map((post) =>
            h("li", {}, [
              h("a", { href: post.data.external_url || post.url }, [
                rawHtml(renderTitle(post.data.title || "")),
              ]),
            ]),
          ),
        ),
        h("p", {}, "All content copyright James Fisher."),
        rawHtml(navbarHtml),
      ]),
      rawHtml(scriptsHtml),
    ]),
  ]);
}
