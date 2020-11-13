---
title: "What is a prediction market?"
tags: ["betting"]
---

"[PredictIt](https://www.predictit.org/support/what-is-predictit) 
is a unique and exciting real money site 
that tests your knowledge of political events
by letting you trade shares on everything 
from the outcome of an election to a Supreme Court decision 
to major world events."
But how does it work?

Let's take an example:
["Will Donald Trump be president at year-end 2019?"](https://www.predictit.org/markets/detail/3352/Will-Donald-Trump-be-president-at-year-end-2019)
Visiting that page,
you see two options:
"Buy Yes" (91¢)
and "Buy No" (10¢).
But what are you actually buying?
If you "Buy Yes",
you're buying a _share_
that reads:

<div class="predictit-share">
  In the event that 
  Donald Trump is president of the United States at 11:59:59 p.m. (ET) on December 31, 2019,
  PredictIt will pay the bearer of this share $1.
</div>

Equivalently, if you "Buy No",
you're buying a share that reads:

<div class="predictit-share">
  In the event that 
  Donald Trump is <b>not</b> president of the United States at 11:59:59 p.m. (ET) on December 31, 2019,
  PredictIt will pay the bearer of this share $1.
</div>

Actually, you don't immediately buy such shares:
you submit _buy offers_ and _sell offers_ at any price you like.
PredictIt then _matches_ buy offers with sell offers.
Imagine that PredictIt have the following offers:

* Alice offers to buy a "Yes" share for 91¢.
* Bob offers to buy a "No" share for 8¢.

PredictIt can't match these offers:
they don't add to $1.
But imagine now that I submit a new offer:

* Jim offers to buy a "No" share for 9¢.

Jim's offer can be matched with Alice's!
Together, Alice and Jim pay 91¢ + 9¢ = $1 to PredictIt.
PredictIt then forges two new shares,
a "Yes" share for Alice and a "No" share for Jim.
At the end of 2019,
either Alice or Jim will be able to redeem their token for $1.
So PredictIt breaks even.

Why would I buy a "No" share for 9¢?
It depends on my belief in how likely it is that
Trump will be president at the end of 2019.
Imagine I believe the chances are 90%.
In that case, 
a "No" share has an expected value of
10% × $1 = 10¢.
So I would be happy to buy a "No" share for 9¢.
Therefore,
the traded value of these shares
has an obvious correspondence to
the probability of the event that backs them.
Since "Yes" shares are trading at 90¢
and "No" shares are trading at 10¢,
we can say that the market's estimate for
the probability that Trump will be president at the end of 2019
is 90-91%.

There are other sites that operate like PredictIt.
They're called [_betting exchanges_](/2019/03/31/what-is-a-betting-exchange/).
One example is BetFair, which is predominantly for sports betting.
But, nested under their "Sports" categories
is an obscure sport called "Politics"!
One of the markets here
is in fact the same one on PredictIt:
["Trump Exit Date"](https://www.betfair.com/exchange/plus/politics/market/1.129097136).
It reads:

<table class="odds-table">
  <thead>
    <tr><th>Selection</th><th>Back</th><th>Lay</th></tr>
  </thead>
  <tbody>
    <tr><td>Exit in 2019</td><td>16</td><td>19</td></tr>
    <tr><td>Exit in 2020 or later</td><td>1.05</td><td>1.06</td></tr>
  </tbody>
</table>

This table is the same market in disguise!
First, we can convert these "decimal odds" to probabilities
by taking the inverse:

<table class="odds-table">
  <thead>
    <tr><th>Selection</th><th>Back</th><th>Lay</th></tr>
  </thead>
  <tbody>
    <tr><td>Exit in 2019</td><td>6%</td><td>5%</td></tr>
    <tr><td>Exit in 2020 or later</td><td>95%</td><td>94%</td></tr>
  </tbody>
</table>

Notice that "Exit in 2019" and "Exit in 2020 or later" are opposites,
just as "back" and "lay" are opposites.
For example, 
backing "Exit in 2019" is the same as laying "Exit in 2020 or later".
The same market is represented on BetFair twice!
The numbers for this work out:
6% + 94% = 100%,
and 5% + 95% = 100%.
PredictIt's interface for binary (yes/no) markets
removes this duplication,
and makes the probabilities and prices clearer.

What's very odd, though, is that
PredictIt's market and BetFair's market don't agree on the probability.
The PredictIt market puts the probability at 90-91%,
while the BetFair market puts the probability at 94-95%!
This is a significant difference,
and [there is perhaps a profit to be made here](/2019/04/02/what-is-matched-betting/) ...

<style type="text/css">
  .odds-table {
    border: 2px solid black;
    margin: 0 auto;
  }
  .predictit-share {
    border: 6px double black;
    margin: 0 auto;
    padding: 1em;
    max-width: 40em;
  }
</style>
