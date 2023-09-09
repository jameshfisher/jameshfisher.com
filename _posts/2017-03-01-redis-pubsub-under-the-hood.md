---
title: "Redis Pub/Sub under the hood"
---

**Do you want to code a chat app?
Here you’ll see how to do it the hard way.
I show how Redis Pub/Sub works in detail, all the way down to the bits and bytes!
This is the first part of a series of deep dives into Redis.**

At Pusher, instead of treating our system as a stack of black boxes,
we like to get our hands dirty and poke around.
Today we’ll roll up our sleeves and dismantle the drivetrain of Pusher’s pub/sub system:
[Redis](http://redis.io/).
Redis is best known as a key-value server.
Clients open a TCP connection to a redis-server process,
and start sending commands to it which modify the database:

![redis is a key-value server](/assets/2017-03-01/key-value.svg)

But Redis is also a messaging server!
A client interested in donuts can open a TCP connection to the Redis server,
send “[SUBSCRIBE](https://redis.io/commands/subscribe) donuts”,
then wait for donut-related news.
A news outlet can then connect to the Redis server,
send “[PUBLISH](https://redis.io/commands/publish) donuts 3-for-$1”,
and the subscribing client will be notified of this lucrative offer:

![redis is a pub-sub server](/assets/2017-03-01/pubsub-server.svg)

Now let’s zoom in.
We can imagine the Redis process keeping track of each socket’s subscription set:

![redis-server with sockets](/assets/2017-03-01/sockets.svg)

But what does the inside of Redis _really_ look like?
Read on to find out!

## View source!

Today we’ll show how Redis Pub/Sub is implemented
by following [the source](https://github.com/antirez/redis),
which is clean ANSI C.
To follow along,
clone [the repository](https://github.com/antirez/redis)
and run `make` (yes, it is that simple to build).
In this post, I’ll be using [the latest release, 3.2.6](https://github.com/antirez/redis/tree/3.2.6).

Pub/Sub was [introduced in early 2010](http://oldblog.antirez.com/post/redis-weekly-update-3-publish-submit.html)
in [this little commit](https://github.com/antirez/redis/commit/befec3cd91bcc9b5ab470a5e3e06b78bdf1fbc36),
back when Redis was just a single C file, `redis.c`.
It’s a few hundred lines of code and the implementation has not changed much since.
The original Pub/Sub implementation lets clients send three new kinds of command:
`PUBLISH`, `SUBSCRIBE`, and `UNSUBSCRIBE`.
To track subscriptions,
Redis uses a global variable [`pubsub_channels`](https://github.com/antirez/redis/blob/3.2.6/src/server.h#L938) 
which maps channel names to sets of subscribed [client](https://github.com/antirez/redis/blob/3.2.6/src/server.h#L563-L616) objects.
A client object represents a TCP-connected client
by tracking that connection’s [file descriptor](https://github.com/antirez/redis/blob/3.2.6/src/server.h#L567).

![redis-server client objects tracking sockets](/assets/2017-03-01/clients.svg)

When a client sends a `SUBSCRIBE` command,
its client object gets [added to the set of clients for that channel name](https://github.com/antirez/redis/blob/3.2.6/src/pubsub.c#L71).
To `PUBLISH`, Redis [looks up the subscribers in the `pubsub_channels` map](https://github.com/antirez/redis/blob/3.2.6/src/pubsub.c#L232),
and for each client,
it [schedules a job to send the published message](https://github.com/antirez/redis/blob/3.2.6/src/pubsub.c#L242-L245)
to the client’s socket.

## Handling disconnections

Client connections can drop.
Perhaps the client closed the connection,
or a network cable was pulled.
When this happens,
Redis must [clean up the client’s subscriptions](https://github.com/antirez/redis/blob/unstable/src/networking.c#L810).
Let’s say Client A disconnects.
To remove the client from the `pubsub_channels` structure,
Redis would have to visit every channel (“donuts” and “bagels”)
and remove the client from each channel’s subscription set.

But visiting every channel is inefficient:
Redis should only need to visit the “donuts” channel,
because that is the only one that Client A is subscribed to.
To enable this, Redis [annotates each client with its set of subscribed channels](https://github.com/antirez/redis/blob/3.2.6/src/server.h#L609),
and keeps this in sync with the main `pubsub_channels` structure.
With this, instead of iterating over _every_ channel,
Redis only needs to [visit the channels which it knows the client was subscribed to](https://github.com/antirez/redis/blob/unstable/src/pubsub.c#L179).
Let’s draw these sets as red circles:

![redis-server subscription sets](/assets/2017-03-01/subscription-sets.svg)

## Getting concrete

I’ve described the data structures as “maps” and “sets”:
the global `pubsub_channels` variable is _logically_ a `Map<ChannelName, Set<Client>>`,
and each client’s subscription set is a `Set<ChannelName>`.
But these are _abstract_ data structures;
they do not say how we represent them in memory.
Let’s start zooming in to allocated memory blocks.

The `pubsub_channels` map is actually a [hash table](https://github.com/antirez/redis/blob/3.2.6/src/dict.h).
The channel name is hashed to a position in a `2^n`\-sized array, like this:

![redis-server pubsub_channels structure is a hash table](/assets/2017-03-01/pubsub_channels-hash-table.svg)

The `pubsub_channels` array, with buckets from `0` to `7`,
is a single allocated block of memory.
To publish to a channel,
we hash the channel’s name to find its bucket,
then iterate over that channel’s set of clients. 
But different channel names can hash to the same bucket.
Redis handles these collisions by “hash chaining”,
which means each bucket points to a [linked list](https://github.com/antirez/redis/blob/3.2.6/src/dict.h#L47-L56) of channels.

In the example, both channels hashed to bucket `2`.
But anything could happen,
because [Redis picks a random seed for its hash function at start-up](https://github.com/antirez/redis/blob/3.2.6/src/server.c#L3980),
to protect you against [collision attacks](https://en.wikipedia.org/wiki/Collision_attack),
in which a malicious user could subscribe to a large number of channels which all hash to the same bucket,
causing poor performance.

The keys in the channel hash table are _strings_, colored green,
and the values are _sets of clients_, colored red.
But “set” is also an abstract data structure;
how is it implemented in Redis?
Well, the set of clients is another linked list!

![redis-server subscribers are kept in a linked list](/assets/2017-03-01/subscriber-list.svg)

It’s nice to think of the strings “donuts” and “bagels” as embedded in the hash chain objects.
But this is not true: each string has a separate allocation.
Redis uses strings extensively,
and has its own representation for them: [“Simple Dynamic Strings”](https://redis.io/topics/internals-sds).
This is a character array prefixed by its length and the number of free bytes.
We can draw it like this:

![redis-server strings](/assets/2017-03-01/strings.svg)

We are almost at the level of memory blocks, except for one thing: each client’s set of channels.
Redis chooses to _not_ use a linked list here;
instead, [Redis uses another hash table](https://github.com/antirez/redis/blob/3.2.6/src/server.h#L609).
The channel names are the keys of the table:

![redis-server clients have a set of subscribed channels](/assets/2017-03-01/client-channel-set.svg)

Why does Redis use a linked list to represent the channel’s client set,
but a hash table to represent the client’s channel set? We’re not sure.
We suspect the channel’s client set is a linked list because it’s optimized for publishing,
where it iterates over the set.
The client’s channel set is a hash table because it’s optimized for subscribe/unsubscribe,
where it does a lookup in the set.
Let us know if you have insights on this.

Notice also that the _value_ pointers in each client’s hash chain (yellow) are ignored;
they are unused memory.
Only the keys are used when using a hash table to represent a set.
The memory waste is okay compared to the code reuse we gain.

Finally, we’re pretty close to the truth:
each block in the diagram represents a memory allocation in the redis-server process.
Let’s recap our `PUBLISH` and `SUBSCRIBE` algorithms:

* To `PUBLISH`,
  hash the channel name to get a hash chain (yellow).
  Iterate over the hash chain, comparing each channel name (green) to our target channel name.
  Once we’ve found our target channel name, get the corresponding list of clients (red).
  Iterate over the linked list of clients, sending the published message to each client (purple).
    
* To `SUBSCRIBE`,
  find the linked list of clients as before.
  [Append the new client to the end of the linked list](https://github.com/antirez/redis/blob/3.2.6/src/pubsub.c#L76).
  (Actually, [this is a constant-time operation](https://github.com/antirez/redis/blob/3.2.6/src/adlist.c#L119),
  because [the linked lists have a tail pointer](https://github.com/antirez/redis/blob/3.2.6/src/adlist.h#L49).)
  Also, add the channel to the client’s hash table.  

## Realtime hash tables!

Notice that the hash tables are different sizes,
roughly proportional to how many elements they have.
Redis resizes hash tables in response to their number of elements.
But Redis is built for low latency,
and resizing a hash table is a time-consuming operation.
How can it resize the hash table without causing latency spikes?

Answer: Redis _gradually_ resizes the hash table.
[It keeps _two_ underlying hash tables](https://github.com/antirez/redis/blob/3.2.6/src/dict.h#L79),
the old and the new.
Consider this `pubsub_channels` hash table in the middle of a resize:

![redis-server realtime hash table in the middle of resizing](/assets/2017-03-01/realtime-hash-table.svg)

Whenever Redis performs an operation on the hash table (lookup, insert, delete …),
[it does a little bit of resizing work](https://github.com/antirez/redis/blob/3.2.6/src/dict.c#L245).
It keeps track of how many old buckets have been moved to the new table, and on each operation, it moves a few more buckets over.
This bounds the amount of work, so that Redis remains responsive.

## Expensive unsubscribes

There’s one more important command in Redis Pub/Sub: `UNSUBSCRIBE`.
`UNSUBSCRIBE` does the inverse of `SUBSCRIBE`:
the client will no longer receive messages published to that channel.
How would you write `UNSUBSCRIBE`, using the data structures above?
Here’s how Redis does it:

* To `UNSUBSCRIBE`,
  find the linked list of clients for the channel, as before.
  Then iterate over the entire list until you find the client to remove.

The `UNSUBSCRIBE` operation is therefore [O(_n_), where _n_ is the number of subscribed clients](https://redis.io/commands/unsubscribe).
With a very large number of clients subscribed to a Redis channel, an `UNSUBSCRIBE` can be expensive.
This means you should either limit your clients or the number of subscriptions that they are allowed.
One of Pusher’s important optimizations is de-duplicating subscriptions:
millions of Pusher subscriptions are collapsed into a much smaller number of Redis subscriptions.

Redis could optimize this by using a hash table instead of a linked list
to represent the set of subscribed clients.
However, this might not be desirable,
because publishes will be a little slower:
iterating over a hash table is slower than iterating over a linked list.
Redis optimizes for `PUBLISH` operations,
since they are more common than subscription changes.

## Pattern subscriptions

The original Redis Pub/Sub API provides `PUBLISH`, `SUBSCRIBE`, and `UNSUBSCRIBE`.
Shortly afterwards, in [this commit](https://github.com/antirez/redis/commit/ffc6b7f864dcaa58b6c5d81d7e595050fe954dec),
Redis introduced [“pattern subscriptions”](https://redis.io/topics/pubsub#pattern-matching-subscriptions).
Pattern subscriptions let a client subscribe to all channels matching a Regex-like pattern,
instead of only subscribing to a single literal channel name.

The important new command is `PSUBSCRIBE`.
Now, if a client sends `PSUBSCRIBE food.donuts.*`,
and a news outlet sends `PUBLISH food.donuts.glazed 2-for-£2`,
the subscribed client will be notified,
because `food.donuts.glazed` matches the pattern `food.donuts.*`.

The pattern subscription system is completely separate to the normal channel subscription system.
Alongside the global `pubsub_channels` hash table,
there is [the global `pubsub_patterns` list](https://github.com/antirez/redis/blob/3.2.6/src/server.h#L939).
This is a linked list of [pubsubPattern](https://github.com/antirez/redis/blob/3.2.6/src/server.h#L982-L985) objects,
each of which associates one pattern with one client.
Similarly, [each client object has a linked list](https://github.com/antirez/redis/blob/3.2.6/src/server.h#L610)
of the patterns it is subscribed to. 
Here’s what `redis-server` memory looks like
after client B subscribes to `drink?`,
and clients A and B subscribe to `food.*`:

![redis-server pattern subscription implementation](/assets/2017-03-01/pattern-subscriptions.svg)

There is a global linked list down the left-hand side,
each pointing to a `pubsubPattern` (deep red).
Each pattern is represented as its literal string in memory.
On the right-hand side, each client has its own linked list of patterns.

Now, when a client sends `PUBLISH food.donuts 5-for-$1`,
[Redis will iterate through the global `pubsub_patterns` list](https://github.com/antirez/redis/blob/3.2.6/src/pubsub.c#L249-L269),
and [test the string `food.donuts` against each pattern](https://github.com/antirez/redis/blob/3.2.6/src/pubsub.c#L256-L259).
For each successful match,
Redis will send the message `5-for-$1` to the linked client.

This system may surprise you:
multiple clients subscribed to the same pattern do not get grouped together!
If 10,000 clients subscribe to `food.*`,
you will get a linked list of 10,000 patterns,
each of which is tested on every publish!
This design assumes that the set of pattern subscriptions will be small and distinct.

Another cause for surprise is that patterns are stored in their surface syntax.
They are not compiled (e.g. to [DFAs](https://en.wikipedia.org/wiki/Deterministic_finite_automaton)).
This is especially interesting since
[Redis’s matching function `stringmatch`](https://github.com/antirez/redis/blob/3.2.6/src/util.c#L46-L171) has some … _interesting_ worst-cases.
Here is how Redis tests the pattern `*a*a*b` against the string `aa`:

```
stringmatch("*a*a*b", "aa")
    stringmatch("a*a*b", "aa")
        stringmatch("*a*b", "a")
            stringmatch("a*b", "a")
                stringmatch("*b", "")
                    stringmatch("b", "")
                        false
            stringmatch("a*b", "")
                false
    stringmatch("a*a*b", "a")
        stringmatch("*a*b", "")
            stringmatch("a*b", "")
                false
    stringmatch("a*a*b", "")
        false
```

This malicious pattern with many “globs”
causes an exponential blowup in the running time of the match!
Redis’s pattern language could be compiled to a DFA,
which would run in linear time.
But it is not.

In short, you should not expose Redis’s pattern subscriptions to untrusted clients,
because there are at least two attack vectors:
multiple pattern subscribes, and crafted patterns.
At Pusher, we tread very carefully with Redis pattern subscriptions.

## Conclusion

Redis Pub/Sub is an efficient way to distribute messages.
But you should know what it is optimized for, and where the pitfalls are.
To truly understand this, study the source!
In short: only use Redis in a trusted environment,
limit the number of clients,
and handle pattern subscriptions with gloves.

In this post, we only looked at Redis as one single-threaded process.
But Pusher handles billions of messages per day: too many for a single process.
In our next post, we’ll see how Pusher scales Redis Pub/Sub.
Stay tuned!

## Further reading

* [Redis Pub/Sub API docs](https://redis.io/topics/pubsub)
* [Redis weekly update #3: Pub/Sub and more](http://oldblog.antirez.com/post/redis-weekly-update-3-publish-submit.html)
* [Redis Under The Hood](https://pauladamsmith.com/articles/redis-under-the-hood.html)
* [Redis 3.2.6 source](https://github.com/antirez/redis/tree/3.2.6)

_This was originally posted [on the Pusher engineering blog](https://making.pusher.com/redis-pubsub-under-the-hood/)._

<style>
    p > img { border: none; }
</style>