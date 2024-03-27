---
title: Running a Laravel+Pusher workshop at work
tags: []
---

Last Friday afternoon at Pusher, we ran an internal workshop on Laravel+Pusher.
I'm interested in the "workshop" format as a way to knowledge-share in companies.
We currently do lots of talks, but I wanted to test whether workshops were more effective.

Laravel is one of the biggest web frameworks,
second only to Ruby on Rails.
Laravel uses Pusher:
Pusher is in the Laravel source, the docs, and the community.
Despite this, I knew very little Laravel before preparing the workshop.
I ran it with a couple of other employees who knew Laravel better.
This could be a good division of labor for future workshops:
a leader with a plan but superficial knowledge, plus experts on hand to consult.

I started the workshop with a 15-minute talk.
I spent nearly all that time showing how big Laravel is.
In retrospect, I should have spent more time showing what Laravel is and how it's structured.

After my little talk,
we switched to "workshop" mode.
I and the true Laravel experts helped each attendee build a Laravel+Pusher app on their own machine.
We all built the same app.
I tried to make the workshop highly structured,
to guard against the possibility of the workshop becoming "let's all sit on our own and use Laravel for a while".
The workshop was structured as six "checkpoints",
and we were all supposed to move through those checkpoints in lockstep.
The checkpoints were supposed to keep people doing the same thing,
and help each other along.
I wrote the workshop checkpoints on the slides rather than on handouts,
to encourage people to move in lockstep when I changed slide.

On the very first checkpoint - setting up Laravel - we hit a big snag.
The first instructions were to download Vagrant+Virtualbox+VM+Laravel+composer+npm.
With everyone doing this at the same time on the WiFi, it took more than 30 minutes!
Future workshops should give people some "pre-install" instructions ahead of time.

The next checkpoints were smoother.
Inevitably though, people progressed at different paces.
Together with the "checkpoint" system, this meant people were left waiting.
I gave in and sent them the slides!
In future, I would be stricter with the rule:
"if you finish early, you have to help someone else".
This should keep everyone busy and encourage collaboration.
I think people have natural barriers to collaboration though,
so some forced collaboration might be necessary, e.g. pairing.

The workshop lasted a couple of hours.
There were lots of fiddly mistakes along the way, but none fatal.
Some of these mistakes I had already made during workshop preparation,
and the other problems, the experts were able to help with.
Most people were able to get the example app working on their machines.
In total, I probably spent over a day preparing the workshop.
It was very time-consuming to find all the many ways in which people's work could go wrong.
I think it paid off.

Later that day, I sent round a questionnaire asking for feedback on the workshop.
I don't usually send out feedback forms, so this was new to me.
I had one big axe to grind here:
the hypothesis that workshops are far more effective than talks in terms of learning.
Possibly due to my carefully leading questions,
the feedback responses enthusiastically agreed with me.
People also affirmed that the highly structured/checkpointed approach worked well,
despite the problems we had with synchronizing people at the time.

People suggested some future workshops we could hold in future.
I'd like to focus on engineering topics related to the company, and essential for our engineers.
Workshops are a time-expensive investment.
This price can be recouped by concentrating on "evergreen" workshops that you can run several times:
quarterly refreshers, or even external hiring/marketing events.
