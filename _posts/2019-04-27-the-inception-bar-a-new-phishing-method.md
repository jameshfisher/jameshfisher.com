---
title: "The inception bar: a new phishing method"
tags: ["programming", "security", "fave"]
---


Welcome to HSBC, the world's seventh-largest bank!
Of course, the page you're reading isn't actually hosted on `hsbc.com`;
it's hosted on `jameshfisher.com`.
But when you visit this site on Chrome for mobile,
and scroll a little way,
the page is able to display itself as `hsbc.com`:

<img src="{% link assets/2019-04-27/proof.png %}"/>

In Chrome for mobile,
when the user scrolls down, 
the browser hides the URL bar,
and hands the URL bar's screen space to the web page.
Because the user associates this screen space with "trustworthy browser UI",
a phishing site can then use it to pose as a different site,
by displaying its own fake URL bar -
the inception bar!

This is bad, but it gets worse.
Normally, when the user scrolls up,
Chrome will re-display the true URL bar.
But we can trick Chrome so that it never re-displays the true URL bar!
Once Chrome hides the URL bar,
we move the entire page content into a "scroll jail" -
that is, a new element with `overflow:scroll`.
Then the user _thinks_ they're scrolling up in the page,
but in fact they're only scrolling up in the scroll jail!
Like a dream in _Inception_,
the user believes they're in their own browser,
but they're actually in a browser within their browser.
Here's a video of the hack in use:

<video width="100%" controls autoplay loop style="margin: 0 auto; border: 2px solid black;">
  <source src="{% link assets/2019-04-27/demo.webm %}" type="video/webm">
  Your browser does not support the video tag.
</video>

But it gets even worse!
Even with the above "scroll jail",
the user should be able to scroll to the top of the jail,
at which point Chrome will re-display the URL bar.
But we can disable this behavior, too!
We insert a very tall padding element
at the top of the scroll jail.
Then, if the user tries to scroll into the padding,
we scroll them back down to the start of the content!
It looks like a page refresh.
If you're stuck on this page right now,
wondering how to get out:
one way is to move to another app and then back to Chrome,
which seems to trigger Chrome to display the true URL bar.

Is this a serious security flaw?
Well, even I, as the creator of the inception bar,
found myself accidentally using it!
So I can imagine this technique fooling users 
who are less aware of it,
and who are less technically literate.
The only time the user has the opportunity to verify the true URL
is on page load, 
before scrolling the page.
After that, there's not much escape.

In my proof-of-concept,
I've just screenshotted Chrome's URL bar on the HSBC website,
then inserted that into this webpage.
With a little more effort,
the page could detect which browser it's in,
and forge an inception bar for that browser.
With yet more effort,
the inception bar could be made interactive.
Even if the user isn't fooled by the current page,
you can get another try 
after the user enters "gmail.com" in the inception bar!

How can you guard yourself against this attack?
I don't really know.
I see it as a security flaw in Chrome.
But what's the fix?
There's a trade-off,
between maximizing screen space on one hand,
and retaining trusted screen space on the other.
One compromise would be for Chrome to retain a small amount of screen space
above [the "line of death"](https://textslashplain.com/2017/01/14/the-line-of-death/)
instead of giving up literally _all_ screen space to the web page.
Chrome could use this spage to signal that 
"the URL bar is currently collapsed",
e.g. by displaying the shadow of an almost-hidden URL bar.

If you're still stuck on this page,
another way to get out is to
[go to the Hacker News discussion and upvote this article](https://news.ycombinator.com/item?id=19768072).
Or, for hacks similar to this one,
see [this inception attack based on the fullscreen API](https://feross.org/html5-fullscreen-api-attack/),
or [my "custom cursor" inception attack from 2016](https://jameshfisher.github.io/cursory-hack/).

<div id="fakeurlbar" style="display: none; position: fixed; top: 0px; left: 0; height: 74.77037037037037px; width: 100vw; background-image: url('{% link assets/2019-04-27/bar_background.png %}'); background-size: 19px 74.77037037037037px;">
  <img src="{% link assets/2019-04-27/bar_left.png %}" style="float: left; width: 211.72222222222223px;"/>
  <img src="{% link assets/2019-04-27/bar_right.png %}" style="float: right;  width: 124.74444444444444px;"/>
</div>

<script>
  let scrollJailEl = null;
  const initialHeight = window.innerHeight;
  const fakeUrlBarEl = document.getElementById("fakeurlbar");
  const fakeTopHeight = 1000;
  document.body.appendChild(fakeUrlBarEl);
  window.onresize = function() {
    if (window.innerHeight > initialHeight && !scrollJailEl) {
      // Chrome has given up its URL bar! 
      // Create the scroll jail and the fake URL bar!

      const jailScrollTo = window.scrollY;

      fakeUrlBarEl.style.display = "block";

      document.body.style.margin = "0";

      scrollJailEl = document.createElement("div");
      scrollJailEl.style.position = "fixed";
      scrollJailEl.style.overflowX = "scroll";
      scrollJailEl.style.overflowY = "scroll";
      scrollJailEl.style.width = window.innerWidth + "px";
      scrollJailEl.style.height = window.innerHeight + "px";
      scrollJailEl.style.top = "56px";
      scrollJailEl.style.padding = "0 1em";

      // create the fake top
      const fakeTopEl = document.createElement("div");
      fakeTopEl.style.height = fakeTopHeight + "px";
      scrollJailEl.appendChild(fakeTopEl);

      // move everything into the scroll jail
      while (document.body.children.length > 0) {
        const child = document.body.children[0];
        scrollJailEl.appendChild(child);
      }

      document.body.appendChild(scrollJailEl);
      document.body.appendChild(fakeUrlBarEl);

      scrollJailEl.scrollTop = jailScrollTo + fakeTopHeight + 56;

      let scroller;
      scrollJailEl.onscroll = e => {
        clearTimeout(scroller);
        scroller = setTimeout(() => {
          scrollJailEl.scrollTo({
            top: Math.max(scrollJailEl.scrollTop, fakeTopHeight),
            left: 0,
            behavior: 'smooth'
          });
        }, 100);
        console.log("scroll");
      };
    }
  };
</script>