---
title: How Hacker News stays interesting
tags:
  - fave
hnUrl: 'https://news.ycombinator.com/item?id=19010993'
hnUpvotes: 227
---

Last week I wrote [a post called "My parents are Flat-Earthers"](/2019/01/20/my-parents-are-flat-earthers/),
a history of conspiracy theories in my family.
[Someone submitted it to Hacker News](https://news.ycombinator.com/item?id=18951569),
and it sat at the top for an hour or so.
Then, suddenly, the post dropped to position #26!
Here,
I describe how that happened,
why it happened,
and why it's a good thing.

<p><a href="http://hnrankings.info/18951569/" target="_blank"><img src="/assets/2019-01-26-buried/ranking.png" /></a></p>

Truly my father's son,
my first reaction to this plunge was:
"it's a conspiracy!"
After calming down,
I learned that you can reach the moderators at <a href="mailto:hn@ycombinator.com">hn@ycombinator.com</a>.
I received a quick reply:

> A few things happened with that post: 
> a moderator put a penalty on it, 
> and then a software overheated-discussion detector kicked in, 
> and users flagged it.
> Those are primarily about dampening the kinds of discussion that results from articles like this one, 
> not about the article itself. 
> 
> Hacker News (but probably not just HN!) 
> reacts to speculative, exploratory content on controversial topics 
> with all their own pent-up speculation and anecdotes, 
> and the problem is that it just gets nasty. 
> Religious flamewars, 
> harsh judgements of others (including one's own grandparents!), blame, etc. 
> This is not the discussion by which we gratify our [intellectual curiosity](https://news.ycombinator.com/newsguidelines.html), 
> and so it gets cleared away for other threads that might.

My website doesn't have a comments section.
Reading the comments on that Hacker News post,
you can appreciate why!
It's a circlejerk.
Most comments were _science vs. religion_ debates,
the kind that only science-types have.
Others were "How do Flat-Earthers explain _X_?",
knowing full well that no Flat-Earthers are around to answer.
Many other comments were armchair psychoanalysis,
without the patient present in the room.
Several comments were pretty mean.
"It's really fucked up he wrote this about his parents,"
or "I hope my kids have the decency not to trash me in a blog post when they're older."
I tried hard in my post to describe my family respectfully.
My parents' ideas are wacky and get what they deserve,
but I tried hard to avoid _ad hominem_,
and to show that I appreciate my relationship with them.

But were these the comments that triggered the "overheated-discussion detector"?
Perhaps not!
The detector is said to actually fire ["when the number of comments on a submission exceeds its score"](https://github.com/minimaxir/hacker-news-undocumented#flame-war-detector).
With 211 comments vs. 173 points, my post was way above average.
A simple algorithm which avoids any textual analysis,
but isn't this terribly ripe for abuse?

I don't think so.
The overheated-discussion detector was outweighed by humans.
The moderator's reply showed he had spent time and thought,
reading the post and comments before judging.
Burying this post was closer to _curation_ than censorship.
See the difference:
unlike censorship, I received a polite explanation for it;
and unlike censorship, burying is a _visible_ action, right there on the homepage!
My new post was sandwiched between much older, un-buried posts,
and you can frequently see such posts whenever you open the homepage:

<p><img src="/assets/2019-01-26-buried/buried.png" style="max-width: 15cm; display: block; margin: auto" /></p>

If you want to blame Facebook and YouTube for allowing the spread of wild conspiracy theories,
it's hard to also blame calmer forums like Hacker News for moderation.
Thanks to moderation,
when I open [news.ycombinator.com](https://news.ycombinator.com) right now,
I'm pleased to see interesting new posts about C, Chopin, and concurrency;
and no new posts about fake news, anti-vaxxers, or Flat Earth.
