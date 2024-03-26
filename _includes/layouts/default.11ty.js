import { format } from "date-fns";
import h from "vhtml";
import { fragmentHtml } from "../../fragmentHtml.js";
import { rawHtml } from "../../rawHtml.js";
import renderTitle from "../../renderTitle.js";

export const data = {
  layout: "layouts/minimal",
};

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
      h("h3", { style: "margin-top: 3em;" }, "More by Jim"),
      h("div", { class: "posts" }, [
        ...data.collections.fave.map((post) =>
          h(
            "a",
            { class: "post", href: post.external_url || post.url },
            rawHtml(renderTitle(post.data.title)),
          ),
        ),
      ]),
    ]),
    h("p", {}, [
      "Tagged ",
      ...(data.tags ?? []).map((tag, i) =>
        fragmentHtml(
          i ? ", " : undefined,
          h("a", { class: "post", href: `/tag/${tag}` }, `#${tag}`),
        ),
      ),
      ".",
      author === "jim"
        ? ` All content copyright James Fisher ${format(
            data.page.date,
            "yyyy",
          )}. This post is not associated with my employer.`
        : "",
      h("span", { class: "noprint" }, [
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
  );
}
