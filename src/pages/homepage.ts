import { banner } from "../banner";
import { navbar } from "../navbar";
import { renderPosts } from "../renderPosts";
import { scripts } from "../scripts";
import { sortByDate } from "../sortByDate";
import type { Post } from "../types";
import { h } from "../vhtml";

export function renderHomepage(posts: Post[]) {
  const allPosts = sortByDate(posts);

  const hnFavorites = posts
    .filter(
      (post) =>
        !!(
          post.frontmatter.hnUrl &&
          post.frontmatter.hnUpvotes &&
          post.frontmatter.hnUpvotes > 100
        ),
    )
    .sort(
      (a, b) => (b.frontmatter.hnUpvotes ?? 0) - (a.frontmatter.hnUpvotes ?? 0),
    );

  const myFavoritePosts = allPosts.filter(
    (post) =>
      (post.frontmatter.tags ?? []).includes("fave") &&
      !hnFavorites.includes(post),
  );

  return h("html", { lang: "en" }, [
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
    h("body", { class: "experiment-dont-show-link-summaries" }, [
      banner,
      navbar,
      h("div", { style: "margin: 1em" }, [
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
            ", ",
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
        renderPosts(myFavoritePosts),
        h("h3", {}, "All posts"),
        renderPosts(allPosts),
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
      ]),
      scripts,
    ]),
  ]);
}
