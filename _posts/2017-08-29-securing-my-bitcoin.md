---
title: "Securing my Bitcoin"
---

I bought some Bitcoin back in 2012-ish.
I think I have about 3 coins.
They're sitting on an old laptop, also from about 2012.
It's about time I gave those coins some love.

This is a laptop I haven't opened in maybe a year.
I haven't used it seriously since about 2014.
Thus, I was concerned about the health of the machine generally:
whether the hardware works,
whether the HDD is corrupted,
whether it's insecure.

My first step was to make sure the machine is not networked.
It's running Ubuntu 12.04, missing several years of security patches.
Don't want someone stealing my coins as soon as I turn the machine on!
I changed the WiFi password before turning it on.

I plugged it in and left it to charge the battery for a while.
The shitty battery on this machine lasts about 15 minutes.
The machine booted, and while booting did a full disk verification.
No problems.

Logging in, I immediately get a popup:

> Bitcoin: Error opening block database.
> Do you want to rebuild the block database now?

My heart sinks.
Everything is corrupted.
I check my `~/.bitcoin` directory; it at least has a `wallet.dat`.
I copy it to a few different places to "secure" it from anything stupid I might do next.

So what was this error about the block database?
It's from the program `bitcoin-qt` at version 0.8.
This is an old name for the program now known as "Bitcoin Core", now at 0.14.
The error is just about the block database - not the wallet (private keys).
This is in `~/.bitcoin/blocks/`.

```
$ du -sh blocks/
62 G
```

Well shit.
Back in the day I was maintaining a full Bitcoin node.
Last time I booted this thing, it took many hours to catch up with the latest blockchain.
I expect this is infeasible now, and it sounds like most people don't do this.
Today's blockchain is 130G.

There's a distinction between "full node" clients and "thin" clients.
`bitcoin-qt` is one such full node client,
maintaining a full copy of the blockchain in order to verify transactions.
Newer "thin clients" use something called "SPV mode", or "Simplified Payment Verification",
which apparently allows verification without downloading the entire blockchain.
SPV is described in the original Bitcoin paper.
Soon I'll do a blog post studying the paper.

Let's forget the block database, and concentrate on the `wallet.dat`.
I'm in the amusing situation that I can't do much with it!
I refuse to network the machine,
I have no USB drive to transfer from it,
and `bitcoin-qt` refuses to do anything until I deal with its giant block database.

I found that there are multiple programs under `~/Downloads/bitcoin-0.11.2/bin`,
and `bitcoin-qt` is just one of them.
The Bitcoin software is structured as client-server:
there's a daemon called `bitcoind`,
and a client called `bitcoin-cli`.
The `bitcoind` daemon runs an HTTP server on 8332,
which `bitcoin-cli` talks to.

After starting `bitcoind` and waiting an age for it to verify some blocks,
`bitcoin-cli` can list addresses with `bitcoin-cli listreceivedbyaddress`.
By exploring these addresses' transactions, it turns out I only have 2.85 BTC!
Ugh!

Tomorrow I'll get the private keys off this dodgy laptop and into a safer place ...
