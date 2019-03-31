---
title: "What is a betting exchange?"
tags: ["betting"]
---

Consider the following betting websites:
William Hill, Betfair, Smarkets, Bet365, Ladbrokes.
They appear very similar,
but there are two types of company here,
and they operate very differently!
On one side we have _bookmakers_,
and on the other we have _betting exchanges_.
The traditional bookmakers are William Hill, Bet365, and Ladbrokes.
The betting exchanges include Betfair, Smarkets, and Ladbrokes' exchange.
So, what's the difference?

A traditional bookmaker like William Hill
first draws up their own private beliefs in the probability of events,
then offers you some fixed odds based on those beliefs.
For example,
in today's Liverpool vs. Tottenham game,
they offer you:

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

You decide on one of these selections to bet on (e.g. Liverpool to win, with odds 1.55),
then enter a stake (e.g. $10).
The bookmaker accepts,
and agrees to pay you $15.50 if Liverpool win.

In contrast,
a betting exchange like Betfair
allows its users to play the role of bookmaker.
Instead of Betfair drawing up its own private beliefs in the probability of events,
and then offering you odds based on this,
Betfair instead allows its users to offer _other_ users
whatever odds they are comfortable with.
To do so,
Betfair provide a more complex interface like this:

<table class="odds-table">
  <thead>
    <tr><th>Selection</th><th>Back</th><th>Lay</th></tr>
  </thead>
  <tbody>
    <tr><td>Tottenham to win</td><td>6.60</td><td>6.80</td></tr>
    <tr><td>Liverpool to win</td><td>1.60</td> <td>1.61</td></tr>
    <tr><td>Draw</td>            <td>4.40</td> <td>4.50</td></tr>
  </tbody>
</table>

The values under the "Back" column have a similar meaning
to before:
if you place $10 on Liverpool to win with odds 1.60,
then if Liverpool win, you'll receive $16;
but if Liverpool don't win, you'll receive nothing.
This is a "back bet",
and it's similar to what you do at a bookmaker.

The "Lay" column is new.
This lets you play the role of bookmaker!
If you place a $10 lay bet on Liverpool to win at odds 1.60,
you're effectively allowing another user
to place a normal $10 back bet against you.
So if Liverpool win, you'll have to _pay_ them $16;
but if Liverpool don't win, you'll keep their $10.

Actually, the table of odds that Betfair provide is just a guide.
Unlike at a bookmakers,
you can place back bets and lay bets at any odds you like,
and any stake you like!
This then goes into a pool of _unmatched_ bets.
For example,
Betfair could currently have the following unmatched bets:

* Alice backs Liverpool to win at 1.61, and would stake up to $10.
* Bob lays Liverpool to win at 1.60, and would accept up to a $50 stake.

In this scenario, could Betfair match Alice and Bob's bets?
No:
for Alice's $10,
Bob is only willing to pay her $16 if Liverpool win,
but Alice wants at least $16.10.
So these bets sit unmatched,
waiting for someone to place a new bet which would match with them.
Now, imagine that I, Jim, placed a new unmatched bet:

* Jim backs Liverpool to win at 1.60, and would stake up to $20.

Now, Jim's bet can be matched with Bob's!
Jim buys $20 of Bob's $50 offer,
leaving Bob with a partially matched bet.
This leads us to a new state:

* Jim backs Liverpool to win at 1.60, and stakes $20.
  (A matched bet.)
* Alice backs Liverpool to win at 1.61, and would stake up to $10.
  (An unmatched bet.)
* Bob lays Liverpool to win at 1.60, and would accept up to a $50 stake,
  of which $20 has been accepted.
  (A partially matched bet.)

<style type="text/css">
  .odds-table {
    border: 2px solid black;
    margin: 0 auto;
  }
</style>