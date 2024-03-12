const { format } = require("date-fns");
const renderTitle = require("./renderTitle.js");

const navbarHtml = require("./navbar.js");

const dataPeople = require("./_data/people.js");

exports.render = function (data) {
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
  <body>
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

    <h3>Favorite posts</h3>
    <div class="posts no-link-underlines">
      ${data.collections.fave
        .reverse()
        .filter((post) => !post.draft)
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

    <script>
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

      ga('create', 'UA-90722538-1', 'auto');
      ga('send', 'pageview');

    </script>
  </body>
</html>
`;
};
