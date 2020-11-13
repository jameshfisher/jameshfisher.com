---
title: "On the absence of energy and time in the virtual world of applications, or, the misconception of the \"distraction-free\" mode"
---

One of the key reasons that I like to read physical books 
in preference to reading things on screen 
is that the potential for distraction is lower. 
For the same reason, 
I prefer to play physical board games, 
and use physical pen and paper to plan things.

Recognizing this, 
some applications have a mode called “distraction-free mode” or similar. 
What this does is remove all other applications and menus from the screen, 
leaving only the specific content of the thing you are working on, 
be it a text document, a chess board, a virtual notepad, or whatever. 
Sublime Text’s distraction-free mode 
‘shows your files full screen,
with nothing but text shown in the center of your monitor. 
All UI chrome is hidden, but accessible.’ 
NetBeans 7.4 followed suit with its own distraction-free mode. 
Apparently the idea originated with WriteRoom, 
where the 
‘full screen writing environment gets your computer out of the way so that you can focus on your work. 
The result is a subtle clearing of the mind’. 
The user interface of medium.com, 
the site you are looking at (Note: this post was originally published on Medium!), 
is obviously inspired by a similar approach.

![Sublime Text’s ‘distraction-free’ mode. Do you feel immersed?](/assets/2014-05-04/sublime.png)

The explicit assumption of this design 
is that we get distracted when using our computers 
because we see things which distract us. 
For example, 
hiding the list of open applications helps us concentrate 
because if I don’t *see* my open email client 
then I won’t fruitlessly check my emails all the time. 
If I don’t *see *the option to change the font, 
I won’t waste time playing around with the font.

Personally, 
this doesn’t ring true. 
“Out of sight, out of mind” doesn’t work. 
If you hide the list of open applications from me, 
I nevertheless know which applications are open. 
At any one time, 
I know whether I have my email client open, 
I know what workspace I left it on, 
and I know where on the screen the window will be if I go to that workspace. 
I know exactly how to navigate to it if I so choose. 
I also know that the font selection box is immediately available to me, 
even if it’s not immediately visible, 
just by exiting distraction-free mode.

I know these things for the same reason that I know where the light switches are in my house, 
I know whether the oven is on, I know where I left my notepad, 
and I know roughly how close the washing machine is to finishing. 
I remember what applications I opened and when and where, 
just like I remember where my washing machine is and when I started it. 
I use the same spatial and temporal memory for virtual applications as I do for physical appliances.

![Everything is minimize](/assets/2014-05-04/owlturd.png)

(Everything is minimize. Originally from [OwlTurd](http://owlturd.com/post/86649052584/lets-not-the-issue-image-twitter-fb).)

But if our virtual world of applications 
is psychologically analogous to our physical world of tools, 
then why do I prefer to read physical books over virtual ones? 
Doesn’t the physical book provide the same distractions as the virtual one — 
there’s always that other book next to it to pick up and read instead, isn’t there?

Many designers have concluded that 
the reason we choose physical books must be that the physical books are just *better*, 
with their crisp text, sharp contrast, and comforting texture. 
As such, 
billions have been spent on developing applications that look and feel like real books, 
with high-resolution displays, 
high-contrast back-lights, 
page-flip animations and sound effects, 
virtual bookshelves, 
and so on. 
In doing so, 
they have replicated the physical-spatial aspects of the real book. 
I can look at the screen and it could almost be a photo of a perfectly bound real book. 
And there are no menus anywhere to destroy the immersion of this experience.

[http://xkcd.com/1367/](http://xkcd.com/1367/)

![Bookshelf with covers outwards](/assets/2014-05-04/my_bookshelf.jpeg)

(Does anyone arrange the books on their bookshelves so that the covers face outwards? Of course not, because their bookshelves do not have the luxury of infinite scrolling space.)

And yet I still stubbornly prefer the real book. 
Why? What’s the difference? 
How is the “book behind a pane of glass” any different to the physical book? 
Why does the physical book remain more immersive?

Here’s the key difference: 
if I’m reading physical books and I want to look something up, 
it takes *effort*. 
I have to expend *energy* to put the book down 
and go over to the bookshelf to get the reference book. 
I have to expend *time* to walk to the bookshelf, 
find the reference book, 
find the search term in its index, 
and follow the index entry to the relevant pages. 
But with the virtual book, 
I have to do neither of these. 
I expend almost no energy: a few flicks of a finger. 
I expend dramatically less time: the time for a Google search, 
let’s say.

These two aspects of the physical world, 
*energy* and *time*, 
are rarely or never modeled in our applications. 
In the virtual world, 
action takes no energy and no time.

It is in fact worse than that. 
Despite our intense work on modeling that other physical aspect, 
*space*, 
our model of space is inaccurate because it does not relate to energy or time. 
In the real world, 
the distance between two objects 
is linearly proportional to the time it takes to travel between them: 
if Australia is twice as far away as India, 
it will take roughly twice as long to get to Australia. 
Energy expenditure is similarly proportional: 
if the supermarket is three times as far away as the corner shop, 
then you will expend roughly three times as much energy getting there.

But how long does it take to travel between two objects with a “virtual distance” between them? 
In Google Earth, it takes logarithmic time: 
when you go to a new address, you zoom out and zoom back in. 
It takes only a little more time to cross a continent than to cross the street. 
In Google Maps, it takes constant time: all travel is teleportation. 
How much more energy does a long journey require? 
None, in fact: 
all journeys require a few keystrokes, 
ending with the gratuitous extra energy you put into smacking the return key with your little finger.

Your operating system probably displays your open applications as pieces of paper on a desk, 
or cards in a stack. 
This cute visual metaphor 
is supposed to enhance your ability to manage your applications 
by utilizing your hard-wired spatial reasoning. 
But this hard-wired system also tells you that 
it will take you more time and energy 
to reach the book in the far corner of your desk 
than to reach the one right next to you. 
How long does it take to switch to the farthest application from the current one? 
It takes linear or logarithmic time, 
or no time at all.

If you are on the Wikipedia page for “Dachschund”, 
how long does it take to get to the page for “Dog”? 
More or less time than it takes to get to the page for “John F. Kennedy”? 
In fact, it takes the same amount of time: they are both one click away. 
If Wikipedia were a library, 
then these books would be filed right next to each other. 
The Library of Wikipedia could not exist in anything like the Euclidean space that we understand.

In terms of mental organization, 
energy expenditure and time expenditure are more important than physical distance. 
The distance between task A and task B on my desktop should not be expressed in terms of space, 
but in terms of energy and time, 
since those are the real-world costs of task-switching.

Many operating systems of the last few years, 
including most mobile operating systems, 
have shed the distinction between ‘open’ applications and ‘closed’ applications. 
We no longer have a task-bar listing ‘open’ applications, 
but a list of all applications. 
Selecting one opens it silently if it is not already opened. 
Since the perceived time to launch an application is the same as the time to switch to an application, 
it is psychologically more correct to say that ‘all applications are open.’

The same reasoning applies to web pages. 
Since it would take no time or effort for me to go to reddit.com right now, 
it may be psychologically more correct to say that I am already on reddit.com right now, 
even if it is not in the focused window. 
We bear the mental burden of having all applications and all web-pages open while working, 
since they take negligible time or effort to reach.

Because we have not incorporated energy and time into our virtual world, 
everything in it is mentally in the same place. 
Our virtual world is an immeasurably cluttered desk, 
an infinitely tall stack of cards, 
a singularity.

“Distraction-free mode” believes that all distractions are akin to ads and pop-ups. 
But the more significant distractions are *latent* distractions of *possibility.* 
This is key to the difference in the potential for distraction between the real and virtual worlds. 
If we wish to make the computer a viable replacement 
for the book, the cinema, or the pen and paper, 
then we need to incorporate energy and time into our applications.

Notice what I’m suggesting: *productivity* is inversely proportional to *distraction potential*,
distraction potential is inversely proportional to *effort*, 
and therefore *productivity is proportional to effort*.
This is a counterintuitive result: 
surely we become more productive by making production less effortful, 
and thereby spreading our finite effort further!

> The grand enterprise since the advent of electricity has been the elimination of time and energy.
>
> -- Marshall McLuhan

From http://nevalalee.wordpress.com/2013/04/16/a-song-of-dos-and-wordstar/:
'I once asked [Stanley Schmidt](http://nevalalee.wordpress.com/2012/09/04/goodbye-worldcon-goodbye-stanley/), 
the legendary former editor of *Analog*, 
why he continued to write acceptance and rejection slips on a typewriter, 
rather than a computer, 
and his answer was simple: it’s faster. 
With a typewriter, 
you just roll in a fresh sheet of paper, 
type the message, 
and slide it into the envelope the author has hopefully provided, 
and you don’t need to worry about saving and printing. 
WordStar benefits from a similar simplicity. 
You aren’t distracted by fonts or anything more than the most rudimentary formatting, 
and you don’t need to worry about how the text will look on the screen: like the Model T Ford, 
WordStar will show you any color you like, 
as long as it’s black. 
Ultimately, 
it’s just you and the story, 
and if it isn’t working, 
there’s no way to fool yourself otherwise. 
Most of us, 
of course, 
will continue to write on a piece of technology far too advanced for our real needs. 
But in the end, 
the words are the stars.'

See http://lifehacker.com/stay-fit-by-scrolling-web-pages-with-a-treadmill-1229946945

Compare to:
  drags are more addictive when faster-acting

***T.B.C. since I got distracted***

_Previously published [on Medium](https://medium.com/@MrJamesFisher/on-the-absence-of-energy-and-time-in-the-virtual-world-of-applications-43e9a6daf7fd)._