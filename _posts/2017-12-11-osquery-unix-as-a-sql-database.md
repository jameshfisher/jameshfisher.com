---
title: "osquery: UNIX as a SQL database"
tags: ["programming", "unix"]
---

[Earlier this year, in "UNIX as a SQL database"]({% post_url 2017-02-14-unix-in-sql %}),
I wrote:

> UNIX is full of tables.
> When we talk about "processes", we're really referring to "rows in a process table."
> When we talk about "file descriptors", we're really referring to "rows in a per-process file descriptor table".
> There are other tables, too:
> a global file table,
> an inode table,
> routing tables,
> a mount table,
> page tables,
> and other tables I don't know about.
>
> These "tables" are custom in-memory data structures,
> but can be understood relationally.
> Here's a simplified description of them in SQL.

When I wrote that, it was only as a conceptual framework and a pipe dream.
But I just discovered that my pipe dream is not just a dream:
it exists, it's active, it has major backing, and over 10K stars on GitHub! 😱
This project is <a href="https://osquery.io/" target="_blank">osquery</a>.
`osquery` lets you query a UNIX system using SQL.

`osquery` effectively replaces hundreds of crusty, confusing UNIX tools
which would otherwise take decades to learn.
I often want to find the ID of the process listening on a particular TCP port.
Through 20 minutes of horrible UNIX incantations, I came up with:

```
$ lsof -P -n  -Fp -s TCP:LISTEN -i :15000 | grep '^p' | cut -dp -f 2
904
```

I challenge you to understand the above.
I don't even know if it's correct.
By contrast, with `osquery`, I was able to write:

```
$ osqueryi --header=false --list "select pid from process_open_sockets where remote_port=0 and local_port=15000"
904
```

I'm sure you've heard the quote:
'Some people, when confronted with a problem, think "I know, I'll use regular expressions."
Now they have two problems.'
This quote can only have come from the UNIX world.
UNIX is obsessed with plaintext formats,
and takes pride in `grep`, `sed`, `cut` and all its other text-munging tools.
But the fact is that these are buggy and hard to learn.
`lsof` admits this and make some concessions with its `-F` flag,
which makes its output "suitable for post-processing".
`osquery`'s most obvious advantage is to do away with all of this,
and allow querying the domain objects
instead of querying some ad-hoc plaintext.

What program is process `904`?
What are its arguments?
With standard UNIX tools,
you'll have to glue together `lsof` and `ps` with some shell magic:

```
$ ps -o args= -p $(lsof -P -n  -Fp -s TCP:LISTEN -i :15000 | grep '^p' | cut -dp -f 2)
nc -l 15000
```

After another 5 minutes of googling:
ah, it's `nc`, instructed to listen on port 15000.
UNIX talks of each tool "doing one thing",
but it's a pain to glue tools together like this.
Nearly all UNIX tools admit this with some ad hoc concessions.
For example, if you know the incantation,
`lsof` can print you the name of the program that's listening on that port.
But if you want the command-line arguments,
you're out of luck and you'll need to glue together multiple tools.

If instead I were to use `osquery`,
I could use `JOIN` over the domain objects instead of joining ad hoc plaintext:

```
$ osqueryi --header=false --list "select p.cmdline from process_open_sockets s join processes p on s.pid = p.pid where local_port=15000 and remote_port=0"
nc -l 15000
```

But there's another, more subtle advantage of `osquery`.
`osquery` clearly exposes the semantics of UNIX
in a way that ad-hoc tooling never can.
Instead of reading ambiguous English `man` pages,
you can read the database schema:

```
$ osqueryi
Using a virtual database. Need help, type '.help'
osquery> .schema process_open_sockets
CREATE TABLE process_open_sockets(`pid` INTEGER, `fd` BIGINT, `socket` BIGINT, `family` INTEGER, `protocol` INTEGER, `local_address` TEXT, `remote_address` TEXT, `local_port` INTEGER, `remote_port` INTEGER, `path` TEXT, PRIMARY KEY (`pid`)) WITHOUT ROWID;
```

There's one big downside:
`osquery` is probably not installed on machines you access.
I don't like using non-standard tools if I can afford to use the defaults.
But I don't feel like I can afford to use the defaults:
the time investment is too expensive
to consult the `man` page for `lsof` and `ps`
every time I want to investigate a process.
