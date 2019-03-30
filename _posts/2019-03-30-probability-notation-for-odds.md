---
title: "Probability notation for odds"
tags: []
---

If you've ever walked into a bookmaker,
or looked at betting sites like Betfair or William Hill,
you'll have seen _odds_,
possibly in multiple notations.
Here I show what these notations mean,
and how to convert them to a better notation called _probability_.

To take an example,
Liverpool are playing Tottenham tomorrow.
For this match,
WilliamHill.com shows me the following odds:

<table class="odds-table">
  <thead>
    <tr><th>Selection</th><th>Fractional Odds</th></tr>
  </thead>
  <tbody>
    <tr><td>Tottenham to win</td><td>5/1</td></tr>
    <tr><td>Liverpool to win</td><td>11/20</td></tr>
    <tr><td>Draw</td><td>16/5</td></tr>
  </tbody>
</table>

The numbers in that table, like "11/20" are _fractional_ odds.
Odds of 11/20 mean that, if you spend $20,
and Liverpool win,
you will receive back $11 plus your original $20 -
and if Liverpool don't win,
you receive nothing.

Fractional odds are not directly comparable,
because both numbers in the notation can change.
For example, which odds are better, 11/20 or 33/60?
Neither: they're the same!
Because of this,
many bookmakers now use _decimal notation_.
On WilliamHill.com,
you can toggle this on,
in which case you get:

<table class="odds-table">
  <thead>
    <tr><th>Selection</th><th>Decimal Odds</th></tr>
  </thead>
  <tbody>
    <tr><td>Tottenham to win</td><td>6.00</td></tr>
    <tr><td>Liverpool to win</td><td>1.55</td></tr>
    <tr><td>Draw</td><td>4.20</td></tr>
  </tbody>
</table>

Decimal notation like "1.55" means,
if you spend $1,
and Liverpool win,
you will receive back $1.55 (but not plus your original $1).
So to convert fractional odds like N/M to decimal,
calculate (M+N)/M.

But there is a still better notation: probability!
Consider buying "Liverpool to win" at decimal 1.55 -
i.e., spending $1 for a possible $1.55 return.
Imagine you believe it's 80% likely that Liverpool will win.
Then you have an 80% chance of gaining 55¢ ($1.55 minus your $1 stake),
and only a 20% chance of losing $1.
Then your expected gain is 80%×55¢ + 20%×-$1 = 24¢.
It's a positive expected gain, so you should take that bet!

Probability notation shows the probability at which
taking the bet gives you an expected gain of $0.
The probability is the inverse of the decimal notation.
For example, decimal 1.55 becomes 1/1.55 = 0.645 = 64.5%.
Now see these odds with probability notation:

<table class="odds-table">
  <thead>
    <tr><th>Selection</th><th>Probability</th></tr>
  </thead>
  <tbody>
    <tr><td>Tottenham to win</td><td>16.7%</td></tr>
    <tr><td>Liverpool to win</td><td>64.5%</td></tr>
    <tr><td>Draw</td><td>23.8%</td></tr>
    <tr><th>Total:</th><th>105%</th></tr>
  </tbody>
</table>

At last,
a key property of these odds becomes clear:
they add to (approximately) 100%!
This is because,
of the three events (win, lose or draw),
_exactly one_ will occur.

But why do these odds add to 105%, not 100%?
This is because William Hill are gaming you!
William Hill have their own private beliefs in the probabilities of these events,
from which they generate odds that give William Hill an expected positive gain.
By analysis of several games,
the total percentage is always between 105% and 108%.

Why don't bookmakers use this percentage notation?
One reason is that, by using fractional or decimal odds,
it's less clear that they're swindling you.
But, recently, some markets do use this notation!
[Smarkets.com](https://smarkets.com/)
shows probabilities alongside decimal odds.

<style type="text/css">
  .odds-table {
    border: 2px solid black;
    margin: 0 auto;
  }
</style>