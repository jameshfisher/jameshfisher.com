---
title: "Vidrio is on Slack"
justification: "I'm making Vidrio. I said I was coming up with a support system. I'm using Slack for this."
---

[vidr.io/support](https://vidr.io/support) just says "email me". I suspect many people won't bother. Instead, I'll be using a public Slack team for support. This can double as a hub for development (just me at the moment!).

The Slack team is [vidrioapp.slack.com](https://vidrioapp.slack.com/). I created this last summer but never used it. Let's use it!

One problem: "public Slack teams" aren't really a thing. An admin has to send out an invite to each member who wants access. A popular hack around this is [slackin](https://github.com/rauchg/slackin), which runs a server to automate these invites. [Here's an example](http://elmlang.herokuapp.com/).

Slackin wants me to

* Create a new admin user, `slackin-inviter` - done
* Create an API token for that user. The instructions for this aren't clear. I had to visit https://api.slack.com/custom-integrations/legacy-tokens as the `slackin-inviter` user.
* Deploy using [zeit.co/now](https://zeit.co/now) - done.

Now we have [a slack inviter domain!](https://now-examples-slackin-sfakrrzjir.now.sh). I created a test account with it; it works.

Now to point people to it from [vidr.io/support](https://vidr.io/support). Done.

I think I can set this up at `https://slack.vidr.io`, but that's a future job.
