const markdownIt = require('markdown-it');
const { format } = require('date-fns');

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

const dataPeople = require('./_data/people.js');

exports.render = function(data) {
  function renderPost(post) {
    if (post.diary) return `<span class="post diary_entry">Diary: ${post.word_count} words</span>`;

    return `<a class="post" href="${ post.data.external_url ? post.data.external_url : post.url }"${ post.external_url ? ' target="_blank"' : '' }>
      ${ post.data.author !== 'jim' ? `Guest post by ${dataPeople[post.data.author].name}: ` : '' }${markdownItRenderer.renderInline(post.data.title || '')}
      ${ post.data.external_url ? `<img src="/assets/Icon_External_Link.svg" alt="external link" />` : ''}
      <span class="date">(${format(post.date, 'yyyy-MM-dd')})</span>
    </a>`;
  }

  function renderDayPosts(col, dayPosts) {
    const weekdayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return dayPosts.length === 0 ? `<div class="day day_no_posts">${weekdayNames[col]}</div>`
      : `<div class="day day_posts">${ dayPosts.map(renderPost).join('') }</div>`;
  }

  function renderWeekPosts(weekPosts) {
    const days = [[], [], [], [], [], [], []];
    for (const post of weekPosts) days[parseInt(format(post.date, 'i'))-1].push(post);
    return `<div class="calendar_week">${days.map((day, i) => renderDayPosts(i, day)).join('')}</div>`;
  }

  const postsByWeek = new Map();
  for (const post of data.collections.posts.filter(post => !post.draft)) {
    const week = format(post.date, 'RRRR-II');
    postsByWeek.set(week, postsByWeek.get(week) || []);
    postsByWeek.get(week).push(post);
  }

  const weeksDesc = [...postsByWeek.keys()];
  weeksDesc.sort();
  weeksDesc.reverse();

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
    <style>
      .post { display: block; padding: 0.3em; }
      .post:hover { background-color: antiquewhite; }
      .post.diary_entry { color: #777; }
      @media (min-width: 680px) {
        div.calendar { border: 1px solid #aaa; }
        div.calendar_week { display: flex; flex-direction: row-reverse; }
        div.day { flex-grow: 1; border: 1px solid #aaa; display: flex; flex-direction: column; }
        div.day.day_no_posts { background-color: #f9f9f9; padding: 0.3em 1em; text-align: center; color: #ddd; }
        .post { flex-grow: 1; border-bottom: 2px solid #aaa; }
        .post:last-child { border: none; }
      }
      @media (max-width: 679.999px) {  /* gross */
        div.day.day_no_posts { display: none; }
      }
    </style>
  </head>
  <body style="max-width: 100%;">
    ${navbarHtml}
    <video autoplay loop muted poster="/assets/jim_512.jpg" class="jim_image" style="width: 192px; padding: 10px; transform: rotate(2deg); margin: 2em auto;">
      <source src="/assets/jim.webm" type="video/webm" />
      <source src="/assets/jim.mp4" type="video/mp4" />
    </video>
    <p>
      <a href="https://www.dailymail.co.uk/sciencetech/article-6973463/Google-Chrome-hit-new-phishing-scam-uses-fake-address-bar-steal-passwords.html" target="_blank">As seen in the Daily Mail!</a>
      I'm the developer of <a href="https://vidr.io">Vidrio</a>, the future of presentation.
      Also find me on <a href="https://github.com/jameshfisher">GitHub</a>,
      <a href="https://stackoverflow.com/users/229792/jameshfisher">Stack Overflow</a>,
      <a href="https://www.linkedin.com/in/jameshfisher/">LinkedIn</a>,
      <a href="https://twitter.com/MrJamesFisher">Twitter</a>,
      <a href="https://www.instagram.com/jameshfisher/">Instagram</a>,
      <a href="https://keybase.io/jameshfisher">Keybase</a>,
      <a href="https://www.producthunt.com/@james_fisher2">Product Hunt</a>.
      Find my old blogs:
      <a href="https://eegg.wordpress.com/">Wordpress (2010-12)</a>,
      <a href="https://medium.com/@MrJamesFisher">Medium (2013-15)</a>.
    </p>

    <h3>Favorite posts</h3>
    <div class="calendar">
      <div class="calendar_week">
        ${
          data.collections.fave.filter(post => !post.draft).map(post => 
            `<div class="day day_posts">${ renderPost(post) }</div>`).join('')
        }
      </div>
    </div>

    <h3>All posts</h3>
    <div class="calendar">
      ${ weeksDesc.map(week => renderWeekPosts(postsByWeek.get(week))).join('') }
    </div>

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
}