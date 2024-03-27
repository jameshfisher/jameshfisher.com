---
title: Replay with sound
justification: The Vidrio site has an autoplay promo video. It's a bit annoying ...
tags: []
summary: >-
  A "Replay with sound" button to control a muted video, implemented using the
  YouTube Iframe API.
---

Video is no longer standalone content to be played with a separate "video player". Nowadays, videos are commonplace as UI elements. Video contrasts with traditional UI elements (text, tables, images) in a few ways. Video is temporal: its state changes through time. Video is noisy: it can have an audio track. And video is interactive: the user can change its state.

This is a challenge when designing a UI. Say you have a promotional site, and you "upgrade" a promo image by replacing it with a video. There are a couple of naïve ways to do this:

1. Make the video autoplay on page load and loop forever. The video is like a "gif". This approach requires no user interaction. However, the user has no control over the video state, which can be annoying.
2. Make the video play on click and stop when finished. This is how most embedded YouTube videos work. This approach lets the user control the video state. However, the user is required to do more work to see the video.

There is a tradeoff here between _requiring interaction_ and _annoying the user_. Many modern sites attempt a compromise between these:

* Guess when the user wants to play the video. Often, this is when the video comes into view.
* Default to muted audio.

This can result in incorrect guesses: the user wants to play the video at a different time, or wanted to listen to the video with audio on. A simple fix is that used by [framer.com](https://framer.com): a "Replay with sound" button. This restarts the video and turns up the audio. The button is visible on top of the video when it is muted.

Framer implements this with a YouTube video. Here's how.

```html
<html>
  <body>
    <div id="player"></div>
    <a id="replay" href="#">Replay with sound</a>
    <script>
    var replayButton = document.getElementById("replay");
    window.onYouTubeIframeAPIReady = function() {
      var player = new YT.Player(
        "player",
        {
          videoId: "b0DP6UhlxeI",
          playerVars: { controls: 0, showinfo: 0, modestbranding: 1, rel: 0 },
          events: {
            onReady: function(e) {
              player.setVolume(0); player.seekTo(0); player.playVideo();
            }
          }
        }
      );
      replayButton.onclick = function(e) {
        player.seekTo(0); player.setVolume(100);  player.playVideo();
        replayButton.parentElement.removeChild(replayButton);
        e.preventDefault(); return false;
      };
    }
    </script>
    <script src="https://www.youtube.com/iframe_api"></script>
  </body>
</html>
```
