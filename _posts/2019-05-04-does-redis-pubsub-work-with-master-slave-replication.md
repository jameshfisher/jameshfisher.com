---
title: "Does Redis Pub/Sub work with master-slave replication?"
tags: ["programming", "redis"]
---

In short: yes!
To see this,
start two Redis servers
in master-slave configuration,
then subscribe to channel `foo` on the slave:

```console
$ redis-server --port 6379 &
$ redis-server --port 6380 --slaveof 127.0.0.1 6379 &
$ redis-cli -p 6380 subscribe foo
Reading messages... (press Ctrl-C to quit)
1) "subscribe"
2) "foo"
```

Now publish something to `foo` on the master:

```console
$ redis-cli -p 6379 publish foo bar
```

You'll find that 
this message _does_ arrive 
at the client subscribed on the slave:

```console
...
1) "message"
2) "foo"
3) "bar"
```

All `publish` commands are replicated to the slave.
You can see this by 
first sending the `sync` command
to the Redis master
using `redis-cli`,
which then becomes a Redis slave
and prints all replicated commands:

```console
$ redis-cli -p 6379 sync
Entering slave output mode...  (press Ctrl-C to quit)
SYNC with master, discarding 76 bytes of bulk transfer...
SYNC done. Logging commands from master.
"publish","foo","bar"
```