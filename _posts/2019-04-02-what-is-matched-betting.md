---
title: "What is matched betting?"
tags: ["betting"]
---

In [my previous post]({% post_url 2019-04-01-what-is-a-prediction-market %}),
I found a curiosity:
an asset with different prices in two different betting exchanges.
This can be used to turn a guaranteed profit,
and in this post I show you how!
Consider the question: "Will Donald Trump be president at year-end 2019?"
Just like betting on sports,
you can bet on the answer to this question.
[On PredictIt](https://www.predictit.org/markets/detail/3352/Will-Donald-Trump-be-president-at-year-end-2019),
the market estimates the probability of "Yes" at 90-91%.
But [on BetFair](https://www.betfair.com/exchange/plus/politics/market/1.129097136),
the market which estimates the probability at 94-95%!
We can exploit this difference in beliefs
to turn a guaranteed profit,
through the magic of _matched betting_!

Because the PredictIt market thinks it's less likely 
that Trump will still be president,
they're willing to offer a better return on "Yes",
so we'll buy some "Yes" at PredictIt.
Conversely,
BetFair offers a better return on "No",
so we'll buy some "No" at BetFair.
But how much should we buy?
First,
I'll show you the magic numbers
for how to make a guaranteed profit,
and then I'll show you how to calculate them.
Here's what we should buy:

* $850 of "Yes" at PredictIt.
* $58.38 of "No" at BetFair.

If we purchase this,
how much profit will we make?
The cost is $850+$58.38 = $908.38,
but what's the revenue?
The revenue depends on 
whether Trump is still president at the end of the year.

* Case A:
  If Trump is still president,
  we make our revenue from PredictIt.
  We bought 934 shares, at 91¢ each, and each yields $1.
  This gives us a revenue of $934.
* Case B:
  If Trump is not still president,
  we make our revenue from BetFair.
  We bought $58.38 at odds 16.00,
  making revenue of 16 * $58.38 = $934.
  (Plus 8¢ change due to a rounding error.)

In either case, the revenue is $934.
Minus our costs, our guaranteed profit is $25.62.
Magic!
But where did those magic numbers $850 and $58.38 come from?

First, we fix one of the numbers.
It turns out that PredictIt only allows you to bet up to $850 in one market,
so we fix our PredictIt purchase at that maximum.
Then we choose an amount to bet at BetFair
_such that the profit in either case is the same_.
We can formulate some equations to solve:

```
P  := profit we'll make in either case
Bb := amount to bet at BetFair
Bp := amount to bet at PredictIt
Ob := odds at BetFair
Op := odds at PredictIt

P = Bp*Op - (Bp + Bb)     // profit in Case A (Trump is still president)
P = Bb*Ob - (Bp + Bb)     // profit in Case B (Trump is not still president)

Bp*Op = Bb*Ob             // combine simultaneous equations
Bb = Bp*Op / Ob           // solve for how much to bet at BetFair
Bb = 850 * (1/0.91) / 16  // plug in the real-world numbers
Bb = 58.38                // this is how much to bet at BetFair
```

In the world of betting,
this technique is called _matched betting_.
In the world of trading,
this technique is called arbitrage.
Arguably,
your profit is derived from the service you provide
of transferring information
from one market to the other.