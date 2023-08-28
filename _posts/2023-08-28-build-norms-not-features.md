---
title: "Build norms, not features"
tags: ["essay", "product"]
---

In this post, I claim product developers should stop building social _features_,
and start building social _norms_.
If you're selling a multi-user product, you're not just selling features, you're selling _norms_.
I use the LessWrong forum as an example of how careful product design can build a community's social norms.

I bet you've experienced what I call "Shift-Enter anxiety."
Visiting a new app, will the ⏎Enter key create a new paragraph,
or will it prematurely send my message?
With this micro-stress, I must make a guess:
does it look like this app wants long-form writing?
Is the input box large?
Are other people posting multiple paragraphs?
If so, I hit ⏎Enter, and pray for a new paragraph.

But the effect also works in reverse!
If ⏎Enter creates a new paragraph, I'll write longer messages.
Then, by posting my longer message,
I help build the social norm that _this is a place for long-form_.
[Nudge theory](https://en.wikipedia.org/wiki/Nudge_theory) tells us that defaults are powerful.
But in multi-user platforms, defaults are all-powerful:
first they determine individual behavior,
then this determines group behavior,
and then this sets off a positive feedback loop.

[LessWrong](https://www.lesswrong.com/) is a great example of norm-building.
LessWrong is a forum with various features.
But the developers don't see themselves as building social _features_ in a _product_.
Instead, they're building [social _norms_](https://en.wikipedia.org/wiki/Social_norm) in a _community_.
Social norms are shared expectations of how to work together.
The LessWrong community has strong social norms,
such as _long-form writing_ and _rationality_.
The forum developers can't build those norms directly,
but they can help build them with _defaults_ and _nudges_.

To start with, the forum states its norms.
The community guidelines are below each comment box:

> Aim to explain, not persuade.
> Try to offer concrete models and predictions.
> If you disagree, try getting curious about what your partner is thinking.
> Don't be afraid to say 'oops' and change your mind.

This technique &mdash; just stating the desired norms at the point users must consider them &mdash;
is simple and powerful,
but surprisingly under-used.
I bet your enterprise Slack or Notion has no such norms stated anywhere.

In a LessWrong comment, ⏎Enter creates a new paragraph.
There are no realtime notifications.
Timestamps are only accurate to the hour, not the minute.
There's a separate feature called "shortform".
All these feature choices help build the social norm of _long-form, async comms_.

Voting is another way to reinforce norms.
Each comment on LessWrong has _two_ voting axes!
The first axis is the traditional "How much do you like this?".
The second axis is: "How much do you agree with this, separate from whether you think it's a good comment?".
By explicitly moving "agreement" onto a separate axis,
the forum tries to _unbuild_ the "groupthink" social norm that plagues so many other forums.

We've seen two "norm containment" features:
the "shortform" feature and the "agreement voting" feature.
Surprisingly, they help to build the _opposite_ norms!
The "shortform" feature says: "Normal posts are long-form and carefully edited."
The "agreement voting" feature says: "Normal voting should not consider agreement."
If you're trying to _unbuild_ a social norm, try _containing_ it by building a separate feature for it!

As well as voting, you can _react_ to comments.
In most apps, reactions are "emojis".
But on LessWrong, reactions have strong meanings, like:
"Changed My Mind", "Insightful", or "Good Facilitation".
Emojis can be ambiguous, which [can even cause legal issues](https://tidbits.com/2023/07/22/the-unbearable-ambiguity-of-emoji/)!
LessWrong's word-based reactions clearly show users what's expected of them.

If you're selling a collaboration product, you're not selling features.
You're selling norms.
Remember [Google Wave](https://en.wikipedia.org/wiki/Google_Wave),
where the limit was your imagination,
but no one knew what they were expected to do?
It's justifiably dead.
When I use Slack,
I need the _other_ people using Slack to use Slack how I expect people to use Slack.
If the servers go down, `#ops` is not async!

Instead of building features, try building norms.
"In Q3, we're building a chat-less-after-work norm.
In Q4, we'll deprecate the default-private-chat norm."
Which social norms are you selling?
Do your defaults nudge people towards those norms?
Which tiny tweaks can radically change the culture?
Examine your defaults, and build your norms!
