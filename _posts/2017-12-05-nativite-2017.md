---
title: 'Nativité 2017: creating a Facebook Messenger bot'
tags: []
summary: >-
  Creating a Facebook Messenger bot for a Christmas game 'Nativité', switching
  from expensive SMS notifications. The bot is hosted on Heroku and Netlify,
  with Pusher for real-time updates.
---

[A few days ago I described Nativité, a pastoral Christmas game which I made last year.](/2017/11/26/nativite-a-pastoral-christmas-game/).
I'm updating it for 2017,
switching from SMS notifications to a Facebook Messenger bot.
Here's the latest game:

<iframe width="1024" height="800" src="https://nativite-2017.lantreibecq.com/"></iframe>


Last year, I used Firebase.
This was mostly an excuse to try out Firebase.
I found Firebase pleasant, but also quickly found its limitations.
I wanted to send SMS messages on custom server-side events,
and couldn't figure out how to do this in a secure manner.
I ended up making client-side calls to an external server to fulfil this,
which is a horrible hack!

It also turns out SMS is expensive.
There are four sheep in the game;
each sheep moved a minimum of twelve times;
and each move sends an SMS to the four girls and to me.
I was using AWS SNS to send messages,
which at the time was charging around 10c for each message to France.
That's a minimum of 4 &times; 12 &times; 5 &times; 10c = $24 in messaging costs!
(Today's SNS pricing for SMS is much cheaper and more uniform:
around 0.64c per message to anywhere.
But this is still expensive.)

When I was making Nativité last year,
I was in Dedham, deepest rural Essex.
Testing SMS required waving my phone around in the garden,
freezing,
trying to attract the attention of some distant cell tower.
I would receive a few dozen test messages at once,
and see my AWS bill grow a few dollars.
(Since then, I've discovered "WiFi calling",
which seems to magically transfer cellular data over WiFi.
But I didn't know about it then!)

If instead I were to use Facebook Messenger,
the end-user experience would be more pleasant,
my bill would be $0,
and I could test anywhere with an internet connection.
So I did that.

To make a Facebook bot,
I needed to switch out "serverless" for a more standard setup
(Heroku for the server-side,
Netlify for the client-side,
and Pusher for some realtime magic).
After reimplementing everything,
the new client is hosted at <https://nativite-2017.lantreibecq.com/>.

A Facebook Messenger bot is a Facebook App
with the Messenger product added to it.
Mine is app `299278960590947`.
But I don't think end-users see Facebook Apps directly.
Instead, Facebook Messenger bots communicate via a Facebook Page:
if you own both the app and the page,
you can give the app permission to communicate via the page.
[The Page for Nativité is `TheChristChild`](https://www.facebook.com/TheChristChild/)
(it was surprisingly hard to find a free unique name).
Facebook Pages have Messenger accounts which users can send messages to;
[here is the Messenger account for `TheChristChild`](https://www.messenger.com/t/TheChristChild).

Pages can't initiate conversations.
Users have to send a message to a Page before it can reply.
I'm using this as a "subscription" mechanism;
anyone sending a message to `TheChristChild` is subscribed to all updates.

Facebook Apps have a review process.
Before an App/Page can interact with the public,
it must have gone through review.
An exception to this is a list of "testers" which can be added to the app.
Surprisingly, it seems that a user does not have to give permission to be added as a tester.
So I added my partner and all her family as testers.

Oh, I also added a little crown to the sheep that's currently winning.
That's all for this year.
