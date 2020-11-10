const markdownIt = require('markdown-it');
const { format } = require('date-fns');
const striptags = require("striptags");

const markdownItRenderer = new markdownIt();

  // FIXME import/require this
const navbarHtml = `<style>
.navbar { display: flex; margin: 1em 0; }
.navbar .navbar-item { flex-grow: 1; text-align: center; }
</style>
<div class="navbar">
  <div class="navbar-item"><a href="/">Jim Fisher</a></div>
  <div class="navbar-item"><a href="/speaking">Speaking</a></div>
  <div class="navbar-item"><a href="/blogroll">Blogroll</a></div>
  <div class="navbar-item"><a href="https://vidr.io">Vidrio</a></div>
  <div class="navbar-item"><a href="https://jameshfisher.com/feed.xml">RSS</a></div>
</div>
`;

const dataPeople = require('../../_data/people.js');

exports.data = {
};

exports.render = function(data) {
  const siteUrl = ''; // FIXME site.url from jekyll _config.yml
  const canonical = `https://jameshfisher.com${this.page.url}`;

  // We don't use eleventy's 'excerpt' feature because it requires us to insert an explicit separator in the .md source.
  // I want the excerpt to just be the first paragraph, which is how it behaved in Jekyll.
  const plaintextExcerpt = striptags((data.content).split('</p>')[0]).replace(/\n/g, ' ');

  const author = data.author || 'jim';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <meta name="theme-color" content="white"/>
    <meta name="keywords" content="${(data.tags || []).join(', ')}"/>
    <meta property="og:title" content="${data.title}"/>
    <meta property="og:type" content="website"/>
    <meta property="og:image" content="${siteUrl}${ data.ogimage || '/assets/jim_512.jpg' }"/>
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
    <a href="/" style="display: block; transform: rotate(-5deg); margin: 0 2em 0 -1.6em; float: left;">
      <video autoplay loop muted poster="/assets/jim_512.jpg" class="jim_image" style="height: 128px; object-fit: cover; padding: 5px;">
        <source src="/assets/jim.webm" type="video/webm" />
        <source src="/assets/jim.mp4" type="video/mp4" />
      </video>
    </a>
    <div id="content">
      <h1>${ author === 'jim' ? '' : 'Guest post: '}${markdownItRenderer.renderInline(data.title || '')}</h1>
      ${ author === 'jim' ? '' : `<h2>By <a href="${dataPeople[author].url}">${dataPeople[author].name}</a></h2>` }
      ${ data.external_url ? 
        `<p>
          <strong>
            <a href="${data.external_url}">
              This post is published externally at
              ${data.external_url}
              <img src="/assets/Icon_External_Link.svg" alt="external link" />.
            </a>
          </strong>
        </p>` : ''
        }
      ${data.content}
      <div style="background-color: #111; color: white; border-radius: 0.5em; margin-top: 1em;">
        <div style="padding: 1em;">
          I just released <a href="https://vidr.io/" style="color: #fd0; font-weight: bold; text-decoration: underline;">Vidrio</a>,
          a free app for macOS and Windows to make your screen-sharing awesomely holographic.
          Vidrio shows your webcam video on your screen, just like a mirror.
          Then you just share or record your screen with Zoom, QuickTime, or any other app.
          Vidrio makes your presentations effortlessly engaging, showing your gestures, gazes, and expressions.
          #1 on Product Hunt.
          Available for macOS and Windows.
        </div>
        <div class="maxwidth pad-sides" style="margin-top: 1em;">
          <!-- <h2>Before/After</h2> -->
          <div style="text-align: center;">
            <div style="width: 320px; display: inline-block;">
              <div style="width: 320px; height: 200px; position: relative;">
                <video loop muted autoplay style="width: 100%; position: absolute; top: 0; left: 0;">
                  <source src="/assets/vidrio/screen_640.mp4" type="video/mp4"/>
                </video>
                <video loop muted autoplay style="width: 100%; position: absolute; top: 0; left: 0; opacity: 0.25;">
                  <source src="/assets/vidrio/webcam_320.mp4" type="video/mp4"/>
                </video>
              </div>
              <p>With <a href="https://vidr.io/" style="color: #fd0; font-weight: bold; text-decoration: underline;">Vidrio</a></p>
            </div>
            <div style="width: 320px; display: inline-block;">
              <div style="width: 320px; height: 200px; position: relative;">
                <video loop muted autoplay style="width: 100%; position: absolute; top: 0; left: 0;">
                  <source src="/assets/vidrio/screen_640.mp4" type="video/mp4"/>
                </video>
                <video loop muted autoplay style="width: 30%; position: absolute; right: 10px; bottom: 10px;">
                  <source src="/assets/vidrio/webcam_320.mp4" type="video/mp4"/>
                </video>
              </div>
              <p>With generic competitor</p>
            </div>
          </div>
        </div>
      </div>
      <h3>More by Jim</h3>
      <p class="posts">
        <ul>
          ${ data.collections.posts
              .filter(post => (post.tags||[]).includes('fave')) /* FIXME can't we just use data.collections.fave instead of filter? */
              .map(post => `<li><a class="post" href="${post.external_url || post.url}">${post.title}</a></li>`)
              .join('') }
        </ul>
      </p>
      <p>
        Tagged ${(data.tags||[]).map(tag => `<a class="post" href="/tag/${tag}">#${tag}</a>`).join(', ')}.
        ${ author === 'jim' ?
           `All content copyright James Fisher ${format(data.page.date, 'yyyy')}.
           This post is not associated with my employer.` :
           `<a href="${dataPeople[author].url}">${dataPeople[author].name}</a> wrote this.
            This post is presumably not associated with their employer.`
        }
        <a href="https://github.com/jameshfisher/jameshfisher.com/edit/master/${data.page.inputPath /* FIXME strip './' */}">Found an error? Edit this page.</a>
      </p>
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
  </body>
</html>
`;
};