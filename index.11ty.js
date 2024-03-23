import { format } from "date-fns";
import dataPeople from "./_data/people.js";
import navbarHtml from "./navbar.js";
import renderTitle from "./renderTitle.js";
import scriptsHtml from "./scripts.js";

export function render(data) {
  function renderPost(post) {
    return `<a class="post" href="${
      post.data.external_url ? post.data.external_url : post.url
    }"${post.data.external_url ? ' target="_blank"' : ""}>
      ${
        post.data.author !== "jim"
          ? `Guest post by ${dataPeople[post.data.author].name}: `
          : ""
      }${renderTitle(post.data.title || "")}
      ${
        post.data.external_url
          ? `<img src="/assets/Icon_External_Link.svg" alt="external link" />`
          : ""
      }
      <span class="date">${format(post.date, "yyyy-MM-dd")}</span>
    </a>`;
  }

  const hnFavorites = data.collections.posts
    .filter(
      (post) =>
        post.data.hnUrl && post.data.hnUpvotes && post.data.hnUpvotes > 100,
    )
    .sort((a, b) => b.data.hnUpvotes - a.data.hnUpvotes);

  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <meta name="theme-color" content="white"/>
    <link rel="canonical" href="https://jameshfisher.com/"/>
    <link rel="icon" type="image/png" href="/assets/jim_128.png" />
    <link rel="stylesheet" href="/assets/all.css" />
    <title>Jim Fisher</title>
  </head>
  <body style="margin: 1em">
    ${navbarHtml}
    <video autoplay loop muted playsinline disableRemotePlayback x-webkit-airplay="deny" disablePictureInPicture poster="/assets/jim_512.jpg" class="jim_image" style="width: 192px; padding: 10px; transform: rotate(2deg); margin: 2em auto;">
      <source src="/assets/jim.webm" type="video/webm" />
      <source src="/assets/jim.mp4" type="video/mp4" />
    </video>

    <p style="max-width: 40em; margin: 0 auto 2em auto; font-size: 1.3em; font-weight: 500; text-align: center">
      👋 I'm Jim, a product engineer.
      I built <a href="https://tigyog.app">TigYog</a>
      and <a href="https://vidrio.netlify.app">Vidrio</a>.
      Find me <a href="https://www.dailymail.co.uk/sciencetech/article-6973463/Google-Chrome-hit-new-phishing-scam-uses-fake-address-bar-steal-passwords.html" target="_blank">in the Daily Mail</a>,
      or more likely on <a href="https://github.com/jameshfisher">GitHub</a>,
      <a href="https://stackoverflow.com/users/229792/jameshfisher">Stack Overflow</a>,
      <a href="https://www.linkedin.com/in/jameshfisher/">LinkedIn</a>,
      <a href="https://twitter.com/MrJamesFisher">Twitter</a>,
      or
      <a href="https://www.producthunt.com/@james_fisher2">Product Hunt</a>.
    </p>

    <h3>Hacker News favorites</h3>
    <div class="posts no-link-underlines">
      ${hnFavorites.map(renderPost).join("")}
    </div>

    <h3>My favorites</h3>
    <div class="posts no-link-underlines">
      ${data.collections.fave
        .reverse()
        .filter((post) => !post.draft && !hnFavorites.includes(post))
        .map(renderPost)
        .join("")}
    </div>

    <h3>All posts</h3>
    <div class="posts no-link-underlines">
      ${data.collections.posts
        .reverse()
        .filter((post) => !post.draft)
        .map(renderPost)
        .join("")}
    </div>

    <h3>Old blogs</h3>
    <ul>
      <li><a href="https://medium.com/@MrJamesFisher">Medium (2013-15)</a></li>
      <li><a href="https://eegg.wordpress.com/">Wordpress (2010-12)</a></li>
    </ul>

    ${scriptsHtml}
  </body>
</html>
`;
}
