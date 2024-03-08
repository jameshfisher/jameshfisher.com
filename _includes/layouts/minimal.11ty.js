const striptags = require("striptags");

const renderTitle = require("../../renderTitle.js");
const navbarHtml = require("../../navbar.js");

const dataPeople = require("../../_data/people.js");

exports.data = {};

function excerpt(content) {
  const paraMatches = content.match(/<p.*?<\/p>/s);
  if (paraMatches === null) return "";
  return striptags(paraMatches[0]).replace(/\n/g, " ").trim();
}

exports.render = function (data) {
  const siteUrl = "https://jameshfisher.com"; // FIXME site.url from jekyll _config.yml
  const canonical = `https://jameshfisher.com${this.page.url}`;

  // We don't use eleventy's 'excerpt' feature because it requires us to insert an explicit separator in the .md source.
  // I want the excerpt to just be the first paragraph, which is how it behaved in Jekyll.
  const plaintextExcerpt = excerpt(data.content);

  const author = data.author || "jim";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <meta name="theme-color" content="white"/>
    <meta name="keywords" content="${(data.tags || []).join(", ")}"/>
    <meta property="og:title" content="${data.title}"/>
    <meta property="og:type" content="website"/>
    <meta property="og:image" content="${siteUrl}${
      data.ogimage || "/assets/jim_512.jpg"
    }"/>
    <meta property="og:url" content="${canonical}"/>
    <meta property="og:description" content="${plaintextExcerpt}"/>
    <meta property="og:site_name" content="jameshfisher.com"/>
    <link rel="canonical" href="${canonical}"/>
    <link rel="icon" type="image/png" href="${siteUrl}/assets/jim_128.png" />
    <link rel="manifest" href="/manifest.json"/>
    <link rel="alternate" type="application/rss+xml" href="https://jameshfisher.com/feed.xml" />
    <link rel="stylesheet" href="/assets/all.css" />
    <title>${data.title}</title>
  </head>
  <body>
    <div class="noprint">
      <a href="/" style="display: block; transform: rotate(-5deg); margin: 0 2em 0 -1.6em; float: left;">
        <video autoplay loop muted playsinline disableRemotePlayback x-webkit-airplay="deny" disablePictureInPicture poster="/assets/jim_512.jpg" class="jim_image" style="height: 128px; object-fit: cover; padding: 5px;">
          <source src="/assets/jim.webm" type="video/webm" />
          <source src="/assets/jim.mp4" type="video/mp4" />
        </video>
      </a>
    </div>
    <div id="content">
      <h1>${author === "jim" ? "" : "Guest post: "}${renderTitle(
        data.title || "",
      )}</h1>
      ${
        author === "jim"
          ? ""
          : `<h2>By <a href="${dataPeople[author].url}">${dataPeople[author].name}</a></h2>`
      }
      ${data.content}
      ${navbarHtml}
    </div>
    <script>
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

      ga('create', 'UA-90722538-1', 'auto');
      ga('send', 'pageview');
    </script>
    <script>
    if (window.navigator && window.navigator.serviceWorker) {
      window.navigator.serviceWorker.register("/service-worker.js");
    }
    </script>
    <script>
    document.addEventListener("DOMContentLoaded", () =>
      Array.prototype.forEach.call(
        document.getElementsByClassName("answer"),
        el => el.addEventListener("click", () => el.classList.add("revealed"))));
    </script>
    <script>
        !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
        posthog.init('phc_PKc1zrAAIg02QKem1HI66te3pOr7ZalApxNTymy7gcN',{api_host:'https://app.posthog.com'})
    </script>
  </body>
</html>
`;
};
