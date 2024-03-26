import striptags from "striptags";
import h from "vhtml";
import dataPeople from "../../_data/people.js";
import navbarHtml from "../../navbar.js";
import { rawHtml } from "../../rawHtml.js";
import renderTitle from "../../renderTitle.js";
import scriptsHtml from "../../scripts.js";

export const data = {};

function excerpt(content) {
  const paraMatches = content.match(/<p.*?<\/p>/s);
  if (paraMatches === null) return "";
  return striptags(paraMatches[0]).replace(/\n/g, " ").trim();
}

export function render(data) {
  const siteUrl = "https://jameshfisher.com"; // FIXME site.url from jekyll _config.yml
  const canonical = `https://jameshfisher.com${data.page.url}`;

  // We don't use eleventy's 'excerpt' feature because it requires us to insert an explicit separator in the .md source.
  // I want the excerpt to just be the first paragraph, which is how it behaved in Jekyll.
  const plaintextExcerpt = excerpt(data.content);

  const author = data.author || "jim";

  return h("html", { lang: "en" }, [
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
        content: `${siteUrl}${data.ogimage || "/assets/jim_512.jpg"}`,
      }),
      h("meta", {
        property: "og:url",
        content: canonical,
      }),
      h("meta", {
        property: "og:description",
        content: plaintextExcerpt,
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
      h("title", {}, data.title),
    ]),
    h("body", {}, [
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
          rawHtml(renderTitle(data.title || "")),
        ]),
        author === "jim"
          ? ""
          : h("h2", {}, [
              "By ",
              h("a", { href: dataPeople[author].url }, dataPeople[author].name),
            ]),
        rawHtml(data.content),
        rawHtml(navbarHtml),
      ]),
      rawHtml(scriptsHtml),
    ]),
  ]);
}
