import { format } from "date-fns";
import { fragmentHtml } from "../../fragmentHtml.js";
import { rawHtml } from "../../rawHtml.js";
import { renderPosts } from "../../renderPosts.js";
import { h } from "../../vhtml.js";

export const data = {
  layout: "layouts/minimal",
};

function postSimilarity(post1Data, post2Data) {
  // Jaccard similarity between tags
  const tags1 = new Set(post1Data.tags || []);
  const tags2 = new Set(post2Data.tags || []);
  const intersection = new Set([...tags1].filter((x) => tags2.has(x)));
  const union = new Set([...tags1, ...tags2]);
  return intersection.size / union.size;
}

function similarPosts(allPosts, thisPostData) {
  return allPosts
    .filter((p) => p.content !== thisPostData.content)
    .map((p) => ({ post: p, similarity: postSimilarity(thisPostData, p.data) }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 6)
    .map((x) => x.post);
}

export function render(data) {
  const author = data.author || "jim";

  return fragmentHtml(
    data.external_url
      ? fragmentHtml(
          h("p", {}, [
            h("strong", {}, [
              h(
                "a",
                { href: data.external_url },
                `This post is published externally at ${data.external_url}`,
                h("img", {
                  src: "/assets/Icon_External_Link.svg",
                  alt: "external link",
                }),
                ".",
              ),
            ]),
          ]),
        )
      : "",
    rawHtml(data.content),

    h("div", { class: "noprint" }, [
      data.hnUrl
        ? h("div", {}, [
            h(
              "a",
              { href: data.hnUrl, target: "_blank" },
              "Discussion on Hacker News.",
            ),
          ])
        : "",
      h("div", {}, [
        "Tagged ",
        ...(data.tags ?? []).map((tag, i) =>
          fragmentHtml(
            i ? ", " : undefined,
            h("a", { class: "post", href: `/tag/${tag}` }, `#${tag}`),
          ),
        ),
        ".",
      ]),
      h(
        "div",
        {
          style:
            "background: #ffeb57; border-radius: 0.5em; margin-top: 1em; padding: 1em;",
        },
        [
          h("div", {}, [
            "👋 I'm Jim, a ",
            h("strong", {}, "full-stack product engineer."),
            " Want to build an ",
            h("strong", {}, "amazing product"),
            " and a ",
            h("strong", {}, "profitable business?"),
            " ",
            h("a", { href: "/cv" }, "Read more about me"),
            " or ",
            h("strong", {}, [
              h(
                "a",
                {
                  href: "mailto:jameshfisher+work@gmail.com?subject=Let%27s%20build%20an%20amazing%20product%21&body=Hey%20Jim%2C%0A%0A",
                },
                "Get in touch!",
              ),
            ]),
          ]),
        ],
      ),
      h("h3", {}, "Similar posts"),
      renderPosts(similarPosts(data.collections.posts, data)),
      h("h3", {}, "More by Jim"),
      renderPosts(data.collections.fave),
    ]),
    h("p", {}, [
      author === "jim"
        ? ` This page copyright James Fisher ${format(
            data.page.date,
            "yyyy",
          )}. Content is not associated with my employer.`
        : "",
      h("span", { class: "noprint" }, [
        " ",
        h(
          "a",
          {
            href: new URL(
              data.page.inputPath,
              "https://github.com/jameshfisher/jameshfisher.com/edit/master/",
            ).href,
          },
          "Found an error? Edit this page.",
        ),
      ]),
    ]),
  ).rawHtml;
}
