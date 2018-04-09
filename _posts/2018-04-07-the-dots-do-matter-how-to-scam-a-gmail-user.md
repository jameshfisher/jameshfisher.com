---
title: "The dots do matter: how to scam a Gmail user"
tags: ["security"]
justification: "people need to know."
---

I recently received an email from Netflix
which nearly caused me to add my card details to someone else's Netflix account.
Here I show that this is a new kind of phishing scam
which is enabled by an obscure feature of Gmail called "the dots don't matter".
I then argue that the dots _do_ matter,
and that this Gmail feature is in fact a misfeature.
Finally I'll suggest some ways the Gmail team can combat such scams in future.
But first, I'll show you the email:

![email from Netflix]({% link assets/2018-04-07/email.png %})

"Odd," I thought, "but OK, I'll check."
The email is genuinely from `netflix.com`,
so I clicked the authenticated link
to [an "Update your credit or debit card" page](https://www.netflix.com/simplemember/editcredit?locale=en-GB),
which is genuinely hosted on `netflix.com`.
No phishing here.
But hang on, the "Update" page showed my declined card as `**** 2745`.
A card number I don't recognize.
Checking my records, I've never seen this card number.
What's going on?

I finally realized that this email is to `james.hfisher@gmail.com`.
I normally use `jameshfisher@gmail.com`, with no dots.
You might think this email should have bounced,
but instead it reached my inbox,
because ["dots don't matter in Gmail addresses"](https://support.google.com/mail/answer/7436150?hl=en):

> If someone accidentally adds dots to your address when emailing you,
> you'll still get that email.
> For example, if your email is johnsmith@gmail.com,
> you own all dotted versions of your address:
>
> * john.smith@gmail.com
> * jo.hn.sm.ith@gmail.com
> * j.o.h.n.s.m.i.t.h@gmail.com

Netflix does not know about this Gmail "feature".
Externally, `jameshfisher@gmail.com` and `james.hfisher@gmail.com` are different identities,
and should have their own Netflix accounts.
I signed up for Netflix account _N1_ backed by `jameshfisher@gmail.com` in 2013.
But in September 2017, someone, let's call her "Eve",
created a new Netflix account _N2_, backed by `james.hfisher@gmail.com`.

Eve has access to account _N2_ because she set its password when signing up,
but I also have access to the account because I own `james.hfisher@gmail.com`,
and so I can follow the password reset process for this account.
I did so.

Eve loves her TV!
She's watched 587 titles in six months,
all from her "Android Device" in Alabama.
She watched three seasons of _Trailer Park Boys_ over a single day in October.
She consumed nearly every day until 22nd March,
when Netflix put her account "on hold" due to payment failure.
Eve had paid for these shows.
She paid $13.99 every month for her Premium plan,
until February when her card `**** 2745` (also billed to Huntsville, Alabama) was declined.

Perhaps this was all a mistake?
Perhaps Eve is actually [one of the twelve James Fishers in Huntsville, AL](https://www.whitepages.com/name/James-Fisher/Huntsville-AL),
and perhaps he typed his email address in wrong when he signed up months ago.
Netflix doesn't do any email address verification when you sign up;
you can start watching shows straight away.

But perhaps this was not a mistake but a _scam_.
I was almost fooled into perpetually paying for Eve's Netflix access,
and only paused because I didn't recognize the declined card.
More generally, the phishing scam here is:

1. Hammer the Netflix signup form
   until you find a `gmail.com` address which is "already registered".
   Let's say you find the victim `jameshfisher`.
1. Create a Netflix account with address `james.hfisher`.
1. Sign up for free trial with [a throwaway card number](https://getfinal.com/).
1. After Netflix applies the "active card check", cancel the card.
1. Wait for Netflix to bill the cancelled card.
   Then Netflix emails `james.hfisher` asking for a valid card.
1. Hope Jim reads the email to `james.hfisher`,
   assumes it's for his Netflix account backed by `jameshfisher`,
   then enters his card `**** 1234`.
1. Change the email for the Netflix account to `eve@gmail.com`,
   kicking Jim's access to this account.
1. Use Netflix free forever with Jim's card `**** 1234`!

Where is the security flaw here?
Some would say it's Netflix's fault;
that Netflix should verify the email address on sign up.
But using someone else's address on signup only cedes control of the account to that person.
Others would say that Netflix should disallow the registration of `james.hfisher@gmail.com`,
but this would force Netflix and every other website
to have insider knowledge of Gmail’s canonicalization algorithm.

Actually, the blame lies with Gmail,
and specifically Gmail's "dots don't matter" feature.
The scam fundamentally relies on the Gmail user responding to an email
with the assumption that it was sent to their canonical address,
and not to some other address from their infinite address set.

Some Gmail power users might claim:
"The dots-don't-matter feature is great.
I get ownership of an infinite set of email addresses!"
But firstly, no one _wants_ this infinite set of email addresses.
Those who _really_ want infinite addresses already have the "plus labelling" feature:
I also own `jameshfisher+spam@gmail.com`, `jameshfisher+work@gmail.com` et cetera.
Plus labelling has similar scam potential, but some legitimate use cases.
But I have certainly never wanted `j.ame.s.h.fis.h.e.r@gmail.com`,
and John Smith never wanted `jo.hn.sm.ith@gmail.com`.
I have never asked someone for her email address only for her to reply,
"it's `jane.doe@gmail.com`, but feel free to add the dot wherever you like."
Each Gmail user has _one_ email address that they think of as theirs;
all the others are mistakes.

Not only do Gmail users not want these extra addresses,
most are not even aware that they _have_ these addresses.
I'm sure my parents are unaware that they own an infinite set of email addresses.
They won't know this,
because Google have never told them,
and this is not how email works anywhere else.
Even the most technically minded Gmail power user refers to "my email address",
not to "my infinite set of email addresses".

Even those Gmail users who are aware of their infinite set of addresses
are probably unaware of the scams that this exposes them to.
We teach people about "phishing" due to emails _from_ dodgy email addresses,
but we don't teach people anything about phishing due to emails _to_ dodgy addresses.
Nevertheless, the result is the same:
the victim loses money to someone else.

And even in the rare case that a Gmail user is aware of their infinite set of addresses,
and they're aware of the phishing attacks that this can expose them to,
this user is unlikely to pick up on it,
because the user interfaces of Gmail and Inbox don't hint anything about a possible scam.
In fact it barely even acknowledges that the email was to a non-standard address.
The only clue in the screenshot above is that the interface says "to james.hfisher",
instead of "to me".

The Gmail team should combat this kind of phishing.
They should officially acknowledge that dots-don't-matter is a misfeature.
Indeed, [the Gmail team admitted that dots-don't-matter is "confusing" way back when they _announced_ the feature in 2008](https://gmail.googleblog.com/2008/03/2-hidden-ways-to-get-more-from-your.html).
Each Google account should have _one_ variant configured as its standard address;
I would set `jameshfisher@gmail.com` as standard,
and maybe John would set `john.smith@gmail.com` as standard.
If an email is sent to a non-standard address,
it should be shown with a warning:

![how to show phishing]({% link assets/2018-04-07/better.png %})

Finally, Gmail users should be able to opt out of dots-don't-matter.
I wish for any mail sent to `james.hfisher@gmail.com` to bounce instead of reaching my inbox.
The dots-don't-matter feature should be disabled by default for any new Google accounts,
and eventually retired.

## Follow-up
