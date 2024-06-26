---
title: 'Monthly review: 2017-02'
tags:
  - monthly-review
  - personal
  - productivity
  - conference
  - open-source
  - c
  - unix
  - networking
  - software-development
  - career
taggedAt: '2024-03-26'
summary: >-
  Focused on learning C, UNIX, and networking fundamentals. To avoid becoming a neckbeard, I'll keep my projects grounded in real-world applications. March will be dedicated to Vidrio.
---

## Life in February

The most important posts in February were life decisions. First, waking up earlier. Three weeks ago I decided to get up at 06:30 each day. The implementation was an alarm, but not in the usual way. I set my alarm on my phone, and put my phone in the kitchen before bed. (I initially thought I would use a separate corded alarm clock, but using my phone is better because I'm forced to put my phone away.) This procedure is helped by a second alarm at 10:00, reminding me to put my phone in the kitchen and go to bed.

The "waking up earlier" change has been successful. My rhythm has stabilized. I have been less successful with leaving work at the desired time. I aimed to leave at 16:30, but have still been leaving around 18:00. The main problem is that evening activities tend to start around 18:00 or 19:00. I wish to find a regular 17:00 activity which forces me out of work.

The second life change in February was to "go paperless". This is ongoing - I've shredded several hundred A4 sheets, with many hundreds/thousands more to go. Going paperless is part of a larger project to organize my home. Don't hoard. Organize the useful stuff. Remove the crap stuff. Only buy good investments.

A third takeaway from February is that _I am not going to become a neckbeard._ My company (Pusher) paid for me to visit [FOSDEM](https://fosdem.org/2017/) this month. I wrote a couple of summaries of talks in the "realtime" track, but the main valuable thing I came away with was not any new technical knowledge. It was a warning. FOSDEM was the caricature neckbeard conference. People with no concern for their health or appearance; their life devoted to open source projects which sounded unimportant. I was struck by my lack of care about open source. It scares me a little that my current project - learning C/UNIX/networking - could turn into a neckbeard project. I need to be careful that it does not, and that it is instead focussed on enhancing my career.


## Technical stuff in February

Now as for the bulk of February's posts: they were on C and UNIX.

* I looked at `fork` and `execve`, the UNIX way to call programs in UNIX.
* I used the `pipe` system call to call a program with its standard pipes, using `fork`, `execve`, and `pipe`.
* To manipulate the file descriptors for this, I had to learn about the `dup`, `dup2` and `close` system calls.
* I also saw `mkfifo`, the system call for "named pipes", which are similar to normal pipes but which are accessible via the filesystem path.
* I wrote a couple more TCP servers, continuing some posts back in December. One uses `fork` to serve new clients, and the other uses threads, which was my first look at the `pthread` API.
* After [my friend Dru](http://alexandrutopliceanu.ro/) pointed me to [libmill](http://libmill.org/), I talked to my friend Rizo about coroutines, and investigated `setjmp` and `longjmp`.
* I started looking at assembly: generating assembly from C, comparing the two assembly syntaxes (AT&T and Intel), and assembling a "hello world".
* I scratched the surface of `lsof`.

I also wrote a few posts on distributed systems: the "happened-before" relation and Lamport timestamps. My intention is to work towards an understanding of consensus algorithms - probably Raft.


## How does this compare to my plan for February?

A mixed bag. In [last month's review](/2017/02/01/monthly-review-2017-01/), I said I would ...

> In February, I'll learn more electronics fundamentals - voltage, capacitance, resistance, etc. I want to complement this by making real circuits.

This didn't play out. I didn't do any of this. I don't regret it; the things I learned are probably more useful. I bought an [Electron](https://store.particle.io/collections/electron) device from [particle.io](https://www.particle.io/), which I want to turn into a bike tracker. I haven't started with this project.

> In February, I'll explore more C fundamentals - such as compilation in detail (object files, assembly). ... I'll learn more UNIX fundamentals - how time-sharing/processes are implemented, and more fundamental socket/networking programs.

I did some of these. I want to concentrate on the socket/networking programs. I think this is valuable knowledge: for my work now and for my future career.

> In February, I'll learn more WebRTC fundamentals - ICE and SDP. I'll make a few "hello world" programs. Soon I'll show the canonical chat program using Pusher as a signaling server.

I did not do any posts on ICE or SDP; those are still the next posts I plan to write. At work (Pusher), I ran a WebRTC evening. We made a clone of Spaceteam. I plan to run another evening in March, probably around adding audio/video to our clone.


## March: the month of Vidrio

Last month, I set these themes: electronics, C, UNIX, networking, WebRTC. These themes are supposed to teach me the fundamentals of real-world programming. They should provide the basis for any future concrete projects/businesses, or for a long-term career in consulting/contracting.

However, these topics alone do not satisfy me. I am also choosing a project for this month as a concrete guide. This project is **Vidrio**, my screen-sharing program. I aim to have it released by the end of March.


## Plan for March

* Complete paperlessness.
* Find a regular 17:00 activity which forces me out of work.
* Release Vidrio.

Next technical things to learn:

* NAT and routing.
* SSL/TLS. Create simple programs with `openssl`.
* More `lsof` posts.
* Electronics: what is voltage?
* Create an SCTP server.
* Fundamentals of assembly. I have bought [Introduction to 64 Bit Assembly Programming for Linux and OS X](https://www.amazon.com/Introduction-Bit-Assembly-Programming-Linux/dp/1484921909)
