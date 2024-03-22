import { format } from "date-fns";
import renderTitle from "../../renderTitle.js";

export const data = {
  layout: "layouts/minimal",
};

export function render(data) {
  const author = data.author || "jim";

  return `
      ${
        data.external_url
          ? `<p>
          <strong>
            <a href="${data.external_url}">
              This post is published externally at
              ${data.external_url}
              <img src="/assets/Icon_External_Link.svg" alt="external link" />.
            </a>
          </strong>
        </p>`
          : ""
      }
      ${data.content}
      <div class="noprint">
        <div style="background: #ffeb57; border-radius: 0.5em; margin-top: 1em; padding: 1em;">
          <div>
            👋 I'm Jim, a <strong>full-stack product engineer.</strong>
            Want to build an <strong>amazing product</strong> and a <strong>profitable business?</strong>
            <a href="/cv">Read more about me</a> or
            <strong><a href="mailto:jameshfisher+work@gmail.com?subject=Let%27s%20build%20an%20amazing%20product%21&body=Hey%20Jim%2C%0A%0A">Get in touch!</a></strong>
          </div>
        </div>
        <h3 style="margin-top: 3em;">More by Jim</h3>
        <div class="posts">
          ${data.collections.fave
            .map(
              (post) =>
                `<a class="post" href="${
                  post.external_url || post.url
                }">${renderTitle(post.data.title)}</a>`,
            )
            .join("")}
        </div>
      </div>
      <p>
        Tagged ${(data.tags || [])
          .map((tag) => `<a class="post" href="/tag/${tag}">#${tag}</a>`)
          .join(", ")}.
        ${
          author === "jim"
            ? `All content copyright James Fisher ${format(
                data.page.date,
                "yyyy",
              )}.
           This post is not associated with my employer.`
            : ""
        }
        <span class="noprint">
          <a href="${
            new URL(
              data.page.inputPath,
              "https://github.com/jameshfisher/jameshfisher.com/edit/master/",
            ).href
          }">Found an error? Edit this page.</a>
        </span>
      </p>
`;
}
