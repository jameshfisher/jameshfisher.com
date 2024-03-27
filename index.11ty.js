import h from "vhtml";
import navbarHtml from "./navbar.js";
import { rawHtml } from "./rawHtml.js";
import { renderPost, renderPosts } from "./renderPosts.js";
import scriptsHtml from "./scripts.js";

export function render(data) {
  const hnFavorites = data.collections.posts
    .filter(
      (post) =>
        post.data.hnUrl && post.data.hnUpvotes && post.data.hnUpvotes > 100,
    )
    .sort((a, b) => b.data.hnUpvotes - a.data.hnUpvotes);

  return `<!doctype html>${h("html", { lang: "en" }, [
    h("head", {}, [
      h("meta", { charset: "utf-8" }),
      h("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      }),
      h("meta", { name: "theme-color", content: "white" }),
      h("link", { rel: "canonical", href: "https://jameshfisher.com/" }),
      h("link", {
        rel: "icon",
        type: "image/png",
        href: "/assets/jim_128.png",
      }),
      h("link", { rel: "stylesheet", href: "/assets/all.css" }),
      h("title", {}, "Jim Fisher"),
    ]),
    h("body", { style: "margin: 1em" }, [
      navbarHtml,
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
          style:
            "width: 192px; padding: 10px; transform: rotate(2deg); margin: 2em auto;",
        },
        [
          h("source", { src: "/assets/jim.webm", type: "video/webm" }),
          h("source", { src: "/assets/jim.mp4", type: "video/mp4" }),
        ],
      ),
      h(
        "p",
        {
          style:
            "max-width: 40em; margin: 0 auto 2em auto; font-size: 1.3em; font-weight: 500; text-align: center",
        },
        [
          "👋 I'm Jim, a product engineer. I built ",
          h("a", { target: "_blank", href: "https://tigyog.app" }, "TigYog"),
          " and ",
          h(
            "a",
            { target: "_blank", href: "https://vidrio.netlify.app" },
            "Vidrio",
          ),
          ". Find me in the Daily Mail, or more likely on ",
          h(
            "a",
            {
              target: "_blank",
              href: "https://news.ycombinator.com/from?site=jameshfisher.com",
            },
            "HN",
          ),
          ", ",
          h(
            "a",
            { target: "_blank", href: "https://github.com/jameshfisher" },
            "GitHub",
          ),
          h(
            "a",
            {
              target: "_blank",
              href: "https://stackoverflow.com/users/229792/jameshfisher",
            },
            "Stack Overflow",
          ),
          ", ",
          h(
            "a",
            {
              target: "_blank",
              href: "https://www.linkedin.com/in/jameshfisher/",
            },
            "LinkedIn",
          ),
          ", ",
          h(
            "a",
            { target: "_blank", href: "https://twitter.com/MrJamesFisher" },
            "Twitter",
          ),
          ", or ",
          h(
            "a",
            {
              target: "_blank",
              href: "https://www.producthunt.com/@james_fisher2",
            },
            "Product Hunt",
          ),
          ".",
        ],
      ),
      h("h3", {}, "Hacker News favorites"),
      renderPosts(hnFavorites),
      h("h3", {}, "My favorites"),
      renderPosts(
        data.collections.fave
          .reverse()
          .filter((post) => !post.draft && hnFavorites.includes(post)),
      ),
      h("h3", {}, "All posts"),
      renderPosts(
        data.collections.posts.reverse().filter((post) => !post.draft),
      ),
      h(
        "div",
        { class: "posts no-link-underlines" },
        data.collections.posts
          .reverse()
          .filter((post) => !post.draft)
          .map(renderPost),
      ),
      h("h3", {}, "Old blogs"),
      h("ul", {}, [
        h(
          "li",
          {},
          h(
            "a",
            { href: "https://medium.com/@MrJamesFisher" },
            "Medium (2013-15)",
          ),
        ),
        h(
          "li",
          {},
          h(
            "a",
            { href: "https://eegg.wordpress.com/" },
            "Wordpress (2010-12)",
          ),
        ),
      ]),
      rawHtml(scriptsHtml),
    ]),
  ])}`;
}
