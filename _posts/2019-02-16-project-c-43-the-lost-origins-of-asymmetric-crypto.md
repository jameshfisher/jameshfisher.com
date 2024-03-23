---
title: 'Project C-43: the lost origins of asymmetric crypto'
tags:
  - programming
  - history
  - fave
hnUrl: 'https://news.ycombinator.com/item?id=19180606'
hnUpvotes: 1
---

Alice lives two doors down from Bob.
They speak to each other over a tin-can telephone,
with a taut string running from Alice's window to Bob's.
But months later,
Alice discovers a second line tied to it,
running into Eve's window!
Eve has been listening in!
Appalled, Alice visits Bob with the news.
What can they do to defeat Eve's wiretap?
Alice suggests that they use a secret code.
But Bob has an entirely different plan!
"Here's what we'll do," Bob says.
"I'll play loud white noise at my end.
With all that noise on the line, 
Eve won't be able to hear you speak.
But I'll be able to,
using my new noise-cancelling headphones!"

Arguably,
Bob has just invented asymmetric cryptography!
Bob's noise source is his private key.
The method is "asymmetric" because
Alice does not need to know Bob's key;
she just encrypts her message by speaking over the noise.
But couldn't Eve defeat this with her own noise-cancelling headphones?
No!
Noise-cancelling headphones work
by taking a noise source,
and playing the right _anti-noise_ to cancel it out.
Bob's headphones can play the right anti-noise,
because they're next to Bob's noise source.
But Eve's noise-cancelling headphones can't,
because they're out of range of Bob's loudspeaker.

This obscure encryption method was described in October 1944 by a Walter Koenig Jr,
who compiled [a report on _Project C-43_](https://apps.dtic.mil/dtic/tr/fulltext/u2/a800206.pdf),
a secret wartime research project on "speech privacy."
In Section 9, "Masking Systems",
Koenig writes that

<p><img src="/assets/2019-02-16/fig21.png" class="aside" /></p>

> One of the first schemes which is
> likely to occur to a person considering how to make speech private
> is to add noise or other disturbing signal to the speech
> and remove it at the other end,
> in other words, to mask the speech.
> [... But in another] system,
> noise is added to the line at the receiving end
> instead of at the sending end.
> Again, the noise can be perfectly random.
> Since the noise is generated at the receiving end,
> the process of cancellation can, theoretically, be made very exact.

From Koenig's almost-lost observation,
we can trace an unbroken line
through to modern asymmetric encryption algorithms!
The document apparently moldered, unread, for 25 years,
before it was picked up by James Ellis at GCHQ.
Inspired by Koenig's report,
Ellis wrote in another secret paper,
[_The possibility of secure non-secret digital encryption_](https://www.gchq.gov.uk/sites/default/files/document_files/CESG_Research_Report_No_3006_0.pdf),
that

<p><img src="/assets/2019-02-16/ellis_fig1.png" class="aside" /></p>

> An ingenious scheme
> intended for the encipherment of speech over short metallic connections
> was proposed by Bell Telephone Laboratories [i.e., Koenig's paper]
> in which the recipient adds noise to the line
> over which he receives the signal. 
> ...
> The above system is essentially analogue ...
> The problem with which we are now concerned is that 
> of trying to find a digital system which is non-secret ...
> We shall now describe a theoretical model
> of a system which has these properties. 

Ellis sketched,
in a diagram resembling Koenig's,
three machines _M1_, _M2_, and _M3_.
These would derive a public key, encrypt, and decrypt.
He described how to implement these using impossibly large lookup tables,
but was unable to find a practical solution.
Three years passed until
a young Clifford Cocks finished the job
in [a sparkling secret one-pager](https://www.gchq.gov.uk/sites/default/files/document_files/Cliff%20Cocks%20paper%2019731120.pdf).

Ellis and Cocks' work was declassified in 1997,
and by now is well-known.
But the legacy of Walter Koenig Jr is almost lost,
the signal drowned by noise generated about an unrelated _Star Trek_ actor.
And, since Koenig's report was a compilation of many people's work on Project C-43,
we'll probably never know
which bright spark had the idea of adding noise
"at the receiving end, instead of at the sending end."
