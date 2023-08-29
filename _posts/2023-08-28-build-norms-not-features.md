---
title: "Build norms, not features"
tags: ["essay", "product"]
---

If you're building a multi-user product, you're not just selling social _features_.
You're selling social _norms_.
In this post, I analyze LessWrong as a great example of product design,
carefully designed to build strong social norms.

[LessWrong](https://www.lesswrong.com/) is a forum with various features.
But the developers don't see themselves as building social _features_ in a _product_.
Instead, they're building social [_norms_](https://en.wikipedia.org/wiki/Social_norm) in a _community_.
Social norms are shared expectations of how to work together.
The LessWrong community has strong social norms,
such as _long-form writing_ and _rationality_.
The forum developers can't build those norms directly,
but they can help build them indirectly.
Let's see how they've achieved this.

**Technique 1: state your norms.**
LessWrong's community guidelines are below each comment box:

> Aim to explain, not persuade.
> Try to offer concrete models and predictions.
> If you disagree, try getting curious about what your partner is thinking.
> Don't be afraid to say 'oops' and change your mind.

This technique is extremely simple and powerful,
but surprisingly under-used!
I bet your enterprise Slack or Notion has no such norms stated anywhere.

**Technique 2: defaults.**
Consider the behavior of the `⏎Enter` button in a text box.
If `⏎Enter` sends my message, I'll write short _messages_.
But if creates a new paragraph, I'll write longer _comments_.
Then, by posting my longer comment,
I help build the social norm that _this is a place for long-form_.
[Nudge theory](https://en.wikipedia.org/wiki/Nudge_theory) tells us that defaults are powerful.
But in multi-user platforms, defaults are all-powerful:
first they determine individual behavior,
then this determines group behavior,
and then this sets off a positive feedback loop.

(Aside: I bet you've experienced what I call "Shift-Enter anxiety."
Visiting a new app, will the `⏎Enter` key create a new paragraph,
or will it prematurely send my message?
With this micro-stress, I must make a guess:
does it look like this app wants long-form writing?
Is the input box large?
Are other people posting multiple paragraphs?
If so, I hit `⏎Enter`, and pray for a new paragraph ...)

**Technique 3: friction.**
The word "friction" in design is often used negatively,
but friction is a powerful way to steer users towards desired behavior.
Consider how LessWrong builds the social norm of _long-form, async comms_.
In a LessWrong comment, `⏎Enter` creates a new paragraph; there is no keyboard shortcut for "Submit".
There are no realtime notifications.
Timestamps are only accurate to the hour, not the minute.
There's a separate feature called "shortform".

**Technique 4: moderation.**
Each user on LessWrong is also a moderator.
They can write their own "moderation guidelines".
On that user's posts,
their moderation guidelines are shown alongside the standard community guidelines below the comment box.

_Voting_ lets users moderate each other, reinforcing established norms.
Each post and comment on LessWrong has an up/down vote box.

However, voting isn't a way to establish norms in the first place:
if bad behavior becomes a community norm,
it will also be reinforced by voting systems.
LessWrong guards against this with _reactions_.
In most apps, you can react to stuff with _emojis_.
But emojis can be very ambiguous ([even causing legal issues!](https://tidbits.com/2023/07/22/the-unbearable-ambiguity-of-emoji/).
On LessWrong, reactions have labels, like:
"Changed My Mind", "Insightful", or "Good Facilitation".
LessWrong's word-based reactions show users what's valued in this community..

**Technique 5: containment.**
Counter-intuitively, one way to build a norm is to build a feature for its _opposite norm_.
I call these "norm containment" features.
LessWrong has two containment features.

One containment feature is called _Shortform_.
"Exploratory, draft-stage, rough, and rambly thoughts are all welcome on Shortform."
Implicit in this description is that such content is _not_ generally welcome elsewhere.
The "shortform" feature says: "Normal posts are long-form and carefully edited."

Another containment feature is called "agreement voting".
Each comment on LessWrong has _two_ voting axes.
The first axis is the traditional "How much do you like this?".
The second axis is: "How much do you agree with this, separate from whether you think it's a good comment?".
By explicitly moving "agreement" onto a separate axis,
the forum tries to _unbuild_ the "groupthink" social norm that plagues so many other forums.
The "agreement voting" feature says: "Normal voting should not consider agreement."

So if you're trying to _unbuild_ a social norm,
try _containing_ it by building a separate feature for it.

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
