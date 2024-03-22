import navbarHtml from "./navbar.js";
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
  const canonical = `https://jameshfisher.com${this.page.url}`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <meta name="theme-color" content="white"/>
    <meta property="og:title" content="${title}"/>
    <meta property="og:type" content="website"/>
    <meta property="og:image" content="${siteUrl}${
      data.ogimage || "/assets/jim_512.jpg"
    }"/>
    <meta property="og:url" content="${canonical}"/>
    <meta property="og:site_name" content="jameshfisher.com"/>
    <link rel="canonical" href="${canonical}"/>
    <link rel="icon" type="image/png" href="${siteUrl}/assets/jim_128.png" />
    <link rel="alternate" type="application/rss+xml" href="https://jameshfisher.com/feed.xml" />
    <link rel="stylesheet" href="/assets/all.css" />
    <title>${title}</title>
  </head>
  <body>
    <a href="/" style="display: block; transform: rotate(-5deg); margin: 0 2em 0 -1.6em; float: left;">
      <video autoplay loop muted playsinline disableRemotePlayback x-webkit-airplay="deny" disablePictureInPicture poster="/assets/jim_512.jpg" class="jim_image" style="height: 128px; object-fit: cover; padding: 5px;">
        <source src="/assets/jim.webm" type="video/webm" />
        <source src="/assets/jim.mp4" type="video/mp4" />
      </video>
    </a>
    <div id="content">
      <h1>Tag: #${data.tag}</h1>
      <ul>
        ${collection
          .map(
            (post) =>
              `<li><a href="${
                post.data.external_url || post.url
              }">${renderTitle(post.data.title || "")}</a></li>`,
          )
          .join("\n")}
      </ul>
      <p>
        All content copyright James Fisher.
      </p>
      ${navbarHtml}
    </div>
    ${scriptsHtml}
  </body>
</html>`;
}
