---
title: What is `lsof`?
tags:
  - lsof
  - posix
  - c
  - programming
  - file-descriptors
  - system-calls
  - networking
taggedAt: '2024-03-26'
summary: >-
  `lsof` lists open system resources, including pipes,
  sockets, and yes, files. It shows their type, owner, and location.
---

In UNIX, "everything is a file". Apparently. So one of the most fundamental UNIX tools is `lsof`, which "`l`i`s`ts `o`pen `f`iles". It can replace other more specific tools like `netstat` and `ps`. Here's the most basic usage:

```
$ lsof | less
COMMAND    PID USER   FD      TYPE             DEVICE   SIZE/OFF     NODE NAME
loginwind  113  jim  cwd       DIR                1,4       1190        2 /
loginwind  113  jim    0r      CHR                3,2        0t0      304 /dev/null
loginwind  113  jim    1u      CHR                3,2        0t0      304 /dev/null
loginwind  113  jim    2u      CHR                3,2     0t4837      304 /dev/null
loginwind  113  jim    9u     IPv4 0x78b5c77b9446ebf7        0t0      UDP *:*
Google     273  jim   14u     IPv4 0x78b5c77ba0da62a7        0t0      TCP 192.168.1.2:58427->23.101.169.175:https (ESTABLISHED)
Google     273  jim   15u   KQUEUE                                        count=0, state=0xa
Google     273  jim   18   NPOLICY
iTerm2     276  jim  txt       REG                1,4     169024 17266852 /Library/Fonts/Mshtakan.ttc
iTerm2     276  jim   31r   PSXSHM                          4096          FNetwork.defaultStorageSession
Slack      277  jim   28      PIPE 0x78b5c77b9bb1f657      16384          ->0x78b5c77b9bb1fad7
sharingd   280  jim    5u    systm 0x78b5c77b951dcbe7        0t0          [1:6:1]
Spotify    281  jim   38u     IPv4 0x78b5c77b99e6c687        0t0      TCP localhost:4381 (LISTEN)
Spotify    281  jim   91r   PSXSHM                          4096          FNetwork.defaultStorageSession
identitys  295  jim   17     NEXUS
Google     411  jim  txt       REG                1,4   25918784 22978297 /usr/share/icu/icudt57l.dat
mysqld     561  jim  cwd       DIR                1,4        952   773691 /usr/local/var/mysql
WhatsApp  2428  jim    7u     unix 0x78b5c77badc6edc7        0t0          ->0x78b5c77badc6c77f

lsof      4010  jim  cwd       DIR                1,4       6494   617912 /Users/jim
lsof      4010  jim  txt       REG                1,4     113648 17590382 /usr/sbin/lsof
lsof      4010  jim  txt       REG                1,4     694528 22976956 /usr/lib/dyld
lsof      4010  jim  txt       REG                1,4  656064512 23196345 /private/var/db/dyld/dyld_shared_cache_x86_64h
lsof      4010  jim    0u      CHR               16,2     0t1555     1681 /dev/ttys002
lsof      4010  jim    1      PIPE 0x78b5c77ba6ef1d97      16384          ->0x78b5c77ba6ef1cd7
lsof      4010  jim    2u      CHR               16,2     0t1555     1681 /dev/ttys002
lsof      4010  jim    4      PIPE 0x78b5c77ba6ef0657      16384          ->0x78b5c77ba6eef697
lsof      4010  jim    5      PIPE 0x78b5c77ba6ef0357      16384          ->0x78b5c77ba6eef817
less      4011  jim  cwd       DIR                1,4       6494   617912 /Users/jim
less      4011  jim  txt       REG                1,4     129536 22440296 /usr/bin/less
less      4011  jim  txt       REG                1,4     694528 22976956 /usr/lib/dyld
less      4011  jim  txt       REG                1,4  656064512 23196345 /private/var/db/dyld/dyld_shared_cache_x86_64h
less      4011  jim    0      PIPE 0x78b5c77ba6ef1cd7      16384          ->0x78b5c77ba6ef1d97
less      4011  jim    1u      CHR               16,2     0t1555     1681 /dev/ttys002
less      4011  jim    2u      CHR               16,2     0t1555     1681 /dev/ttys002
less      4011  jim    3r      CHR                2,0        0t0      303 /dev/tty
```

Hey presto, a list of open files! (I've cut down the list to some interesting examples. There are around 7,000 open files on my machine.)

What is a file? [As I've written before](/2016/12/15/file-descriptor-misnomer/), it's a misnomer, which should be read more vaguely as "resource". `lsof` provides a concrete list of the types of things that are represented as "files": the things in the "TYPE" column.

| Type     | Description
| ---------| -----------
| _Files_
| `REG`    | a regular file
| `DIR`    | a directory
| `LINK`   | a symbolic link file
| `BLK`    | a block special file
| `CHR`    | a character special file
| `FIFO`   | a FIFO special file
| `MPB`    | a multiplexed block file
| `MPC`    | a multiplexed character file
| _Pipes_  |
| `PIPE`   | pipes
| `PORT`   | a SYSV named pipe
| _Sockets_ |
| `unix`   | a UNIX domain socket
| `STSO`   | a stream socket
| `IPv4`   | an IPv4 socket
| `IPv6`   | an open IPv6 network file - even if its address is IPv4, mapped in an IPv6 address
| `inet`   | an Internet domain socket
| `rte`    | an AF_ROUTE socket
| `sock`   | a socket of unknown domain
| _Other_  |
| `KQUEUE` | a BSD style kernel event queue file
| `UNNM`   | an unnamed type file
| XXXX     | the four type number octets if the corresponding name isn't known
