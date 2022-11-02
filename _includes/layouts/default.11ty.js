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
        <script>
          window.discountCodes = {
            findDiscountCode: () => {
              console.log("Searching, beep boop ... 🔎");
              setTimeout(() => {
                console.error("Error: found codes at /assets/discounts.json, but insufficient power to decrypt!! 😱");
              }, 2000);
            }
          };
          console.log("window.discountCodes initialized! 🎉");
        </script>
        <a href="https://tigyog.app/d/C:tWWwvJDWlo/r/busy-beavers" target="_blank">
          <div class="course">
            <p>
              What can computers do?
              What are the limits of mathematics?
              And just how busy can a busy beaver be?
              This year, I’m writing <strong>Busy Beavers</strong>,
              a unique interactive book on computability theory.
              You and I will take a practical and modern approach to answering these questions — or at least learning why some questions are unanswerable!
            </p>
            <p>
              It’s only $9, and you can get <strong>50% off</strong> if you find the discount code ... <span class="secret">Not quite. Hackers use the console!</span>
            </p>
          </div>
        </a>
        <a href="https://tigyog.app/d/C-I1weB9CpTH/r/everyday-data-science" target="_blank">
          <div class="course">
            <p>
              After months of secret toil, 
              I and Andrew Carr released <strong>Everyday Data Science</strong>,
              a unique interactive online course!
              You’ll make the perfect glass of lemonade using Thompson sampling. 
              You’ll lose weight with differential equations. 
              And you might just qualify for the Olympics with a bit of statistics!
            </p>
            <p>
              It’s $29, but you can get <strong>50% off</strong> if you find the discount code ... <span class="secret">Not quite. Hackers use the console!</span>
            </p>
          </div>
        </a>
        <style>
          .course {
            background: #f8f5f1;
            color: #2c2621;
            border-radius: 0.5em;
            margin-top: 1em;
            padding: 0.5em 1em;
            transition: background 0.2s linear;
          }
          .course:hover {
            background: #f5f0eb;
          }
          .secret {
            color: black;
            background-color: black;
          }
        </style>
        <h3>More by Jim</h3>
        <p class="posts">
          <ul>
            ${data.collections.fave
              .map(
                (post) =>
                  `<li><a class="post" href="${
                    post.external_url || post.url
                  }">${renderTitle(post.data.title)}</a></li>`
              )
              .join("")}
          </ul>
        </p>
      </div>
      <p>
        Tagged ${(data.tags || [])
          .map((tag) => `<a class="post" href="/tag/${tag}">#${tag}</a>`)
          .join(", ")}.
        ${
          author === "jim"
            ? `All content copyright James Fisher ${format(
                data.page.date,
                "yyyy"
              )}.
           This post is not associated with my employer.`
            : ""
        }
        <span class="noprint">
          <a href="${
            new URL(
              data.page.inputPath,
              "https://github.com/jameshfisher/jameshfisher.com/edit/master/"
            ).href
          }">Found an error? Edit this page.</a>
        </span>
      </p>
`;
};
