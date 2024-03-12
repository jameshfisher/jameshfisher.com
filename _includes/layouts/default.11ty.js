const { format } = require("date-fns");

const renderTitle = require("../../renderTitle.js");

exports.data = {
  layout: "layouts/minimal",
};

exports.render = function (data) {
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
};
