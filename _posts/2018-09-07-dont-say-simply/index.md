---
title: Don't say simply
draft: true
tags:
  - writing
  - documentation
---

Draft from 2018-01:

A few years ago,
when I got my first Mac,
I wanted to install the programs I’d used on Linux and Windows.
Downloading those programs, I quickly encountered the "DMG" format.
For example, to get Steam, you download `steam.dmg` then double-click on it.
Now, I expected Steam to start running.
Instead, I’d get another window, with another link inside it to `Steam.app`.
If you double-click on `Steam.app`, it finally runs Steam.
I found this odd, but it worked.

I continued like this for many other applications.
After a while, my list of applications grew.
Rather oddly, my applications were listed as "Devices" in the macOS Finder.
The Steam device, Postgres device, MySQL Workbench device, and so on.
Odd, but I ignored it.

But it kept bugging me that, when you open a DMG, it also contains an "Applications" folder.
And if you open that folder,
it contains all kinds of applications,
including lots of applications which you have installed on your computer!
What are they doing in there?

It turns out that the DMG doesn’t "contain" a load of applications in that folder.
Actually, it's a _link_ to your own _local_ Applications folder!
But why would every downloaded program give me an embedded link to my Applications folder?

I eventually discovered, from a colleague, that the DMG is not the program.
The DMG is an INSTALLER!
And you’re never supposed to double-click on the `Steam.app` icon at all.
You’re supposed to use drag-and-drop to _copy_ the `Steam.app` file into your own Applications folder,
which is very helpfully linked for you.
After that you simply unmount the "disk image" -
for that is, it turns out, what "DMG" stands for -
and you’re done!

Simple, right?
That’s what the person who designed `steam.dmg` thought.
And they helpfully told me that they thought it was simple,
by writing "SIMPLY DRAG" in the middle of the DMG image.

Now you might be thinking,
"Jim, stop complaining. It’s not that hard!!
As you’ve said, they even wrote the instructions for how to use it,
right there on the screen!
All you had to do was SIMPLY drag and drop a SINGLE icon!"

And you'd be right.
We think of drag-and-drop as one of the most "simple", "easy", or "intuitive" actions that we can perform on a computer.
Hell, there are babies that can manage drag-and-drop!
And yet I, in my late twenties, working as a professional software engineer, was unable to complete this task.

I may have even read those words "drag and drop" in one of these "disk images",
but I still didn’t follow it.
Why?
Because the instruction made no sense to me!
I didn’t even consider trying it,
because it didn’t fit my mental model of what this thing is.

So, it says "SIMPLY DRAG", but is drag-and-drop actually simple?

To answer this question, we should think about what the word "simple" means.

There’s an excellent talk by Rich Hickey called "Simple Made Easy".
He makes a distinction between two words, "simple" and "easy".
We often use these words interchangeably,
but in Rich Hickey’s definitions,
they’re quite different.
Simplicity, he says, is about _concepts_, and how they’re intertwined.
Ease, on the other hand, is about _nearness_; how close the thing is to me or to my understanding.
He uses etymology to back this up:
"Simple" is derived from something meaning "one fold", or "one braid".
"Easy" is derived from something meaning "lying nearby".
So for example, we can say "X is simple because it only has two concepts, and they’re not intertwined."
And we can say "X is easy because it’s part of bash, and I work with the bash shell every day."

Rich Hickey’s distinction between simplicity and ease is a very useful one.
Unfortunately, the real world doesn’t stick to this definition!
We can see this everywhere when we use the form, "simply do X".
X is an action!
When we say "simply", we usually mean "easily".
So this is my first reason for not using the word "simply":
you probably mean "easily".
"Easily do X."

I would like very much for the world to stick to Rich Hickey's definitions.
Unfortunately, the world won’t budge,
and "simple" usually means some combination of these two things:
"Few, unfolded concepts", and "near to hand/mind".

With this in mind, is "using a .dmg" simple? Is it easy? Is it either of these?
Let’s look at what I needed in order to use that `steam.dmg` file correctly.
We can categorize these required things into _actions_ and _concepts_.
I needed to be able to drag, and to drop.
Two actions.
Actions that babies can do.
Dragging and dropping are apparently easy (not simple!).
But there are a bunch of other things I needed in order to complete that task:
there were several _concepts_ I needed to understand.
I needed to understand that the DMG was not the program. The DMG is the installer.
I needed to understand what "installation" means for macOS - it means "putting it in the Applications folder".
I needed to understand that this icon represented _my_ local Applications folder,
not something "inside the DMG".

So there’s this iceberg.
We’re aware of the _actions_ that need to take place, and we describe those.
But we’re unaware of the _concepts_ that the reader needs, so we forget to explain those.
To tell me how to use the `steam.dmg` file,
the developer told me to use drag-and-drop.
But I needed to be told the concepts which made this operation sensible.
We describe actions (how to manipulate this thing),
to such a degree that it feels to us like we’ve told people everything.
But we forget to describe the concepts, the things that give the actions any meaning.
This is a bias I see in lots of documentation.
We should consciously to bias towards documenting _concepts_, not actions.

By the way, I conceded that drag-and-drop is "simple",
but how "simple" is it, actually?
There’s a question on the Apple StackExchange site, with thirty-something upvotes,
asking how to properly drag and drop on a MacBook Pro.
The top answer needed to include a _diagram_ to show how to drag and drop.

I remember a few years ago,
my housemate at the time had just bought a brand new top-of-the-line MacBook Pro.
When it finally arrived, he excitedly went into his room to set it up.
Ten minutes later, he came to me and said,
"Jim, have you got a minute? I think the trackpad is broken."
I went over to his laptop,
and he explained to me that he couldn’t click on the "Next" button in the Mac setup.
Look at a MacBook Pro.
You might notice that its trackpad doesn’t have any buttons!
So how on earth do you click?
The answer is that you have to press on the trackpad harder than you do to move the cursor around.
When I showed him, he turned red.
He was clearly embarrassed by this, but he shouldn’t have been!
It’s totally not self-explanatory.

For everything you think of as simple,
there are thousands of people who had to Google it.
Using "simply" implies objectivity, "this is innately simple".
This is incorrect.
So this is reason 3 for not using the word "simply".
Simplicity is hopelessly subjective.

A few years ago,
Apple ran a major advertising campaign called "Get a Mac".
It had the slogan, "it just works."
You probably remember it.
But Apple don’t use the phrase "it just works" any more.
Why?
I think one reason Apple don’t use the phrase "it just works" is
due to the reactions from people when something didn't "just work".
"It just works, until it breaks".
"It used to just work".
As soon as it doesn’t "just work" -
like, I don’t know, when you can’t work out how to click -
the phrase "it just works" is absolutely infuriating!
The reason it's inflammatory, I think, is that word "just".
The word "just" functions very similarly to the word "simply".
You can often swap one for the other.
"It simply works."
There are a host of other equivalent phrases.
"Merely".
"Naturally".
"Just".
"Of course".
"Simply".
"Trivially".
"Obviously".
"It’s that simple".
"Boom, you’re done".
When it's not true,
and inevitably it's not true,
you'll be making people angry.

So far I’ve only looked at that one example - a .dmg image which said "SIMPLY DRAG".
I picked that example because it’s probably familiar with many people in the room.
But it goes so much further.
I searched for "simply" using GitHub search - here are some random examples.
"TensorFlow *simply* shifts each variable a little bit in the direction that reduces the cost."
"*Simply* refer to the React docs if you need help executing this step."
"Assuming a monotonic ordering of dimensions, another name we may use to refer to this layout in the code is *simply* ‘dim 0 is minor’."
"*Simply* customize the kiosk.blade.php view to include an additional tab link and tab panel."
If you want more examples, there are 92 million more on GitHub.

We are infatuated with the word "simply".
We’re writing technical documentation about complex things.
Yet we use the word "simply" significantly more than the average English text.
The Laravel project, for example, uses "simply"
six times more frequently than the average English speaker.
Their docs have hundreds of instances of the word "simply",
all of which are illegitimate.

This leads to my next reason to not use the word "simply".
It’s overused, and unimaginative.
If you want to use "simply",
and you feel like it's legitimate,
at least find something else to use.
Like what?
Try being more specific.
"Small".
"No moving parts".
"Little typing required".
"Quick to set up".

These are all better, but you can do better again.
These are all relative terms.
Be comparative.
"Lower maintenance than X".
"Fewer moving parts than X".
"Friendlier learning curve than X".
"Smaller than X".
"Easier than X".
"Requires less typing than X".
"Quicker than X".
"More familiar than X".

Better yet, you could use absolute numbers to show how much simpler your thing is.
"Two form fields".
"Two moving parts".
"5 lines of code".
"100% JavaScript".
"Takes 5 minutes to set up".
Although there's a trap here in this last one,
and I'll get to that in a minute.

Best of all: show, don't tell!
If it only requires "5 lines of code",
don't tell me that - instead tell me what the five lines are!
If your form

---

Draft from 2018-09:

When I got a Mac for the first time, I wanted to install some programs I’d used on Linux and Windows.
When getting those programs, I quickly encountered the “DMG” format.
For example, to get Steam, you download “steam.dmg”, then double-click on it.
Now, I expected Steam to start running, but instead I’d get something like this:

> TODO

It's a window with another link inside it to “Steam.app”, which then runs Steam, the program I wanted.
This two-step process was odd, but it worked.
I continued like this for many other applications.
After a while, my list of applications grew, and, you can see them here in the macOS Finder window:

> TODO

Down the left-hand side, I’ve got Steam, Postgres, MySQL Workbench, and so on.
My applications are listed as “Devices”.
This was odd, but I ignored that.
But it kept bugging me that, when you open a DMG, it contains its own Applications folder:

> TODO

And if you open that folder, it contains all kinds of applications, including ...
lots of applications which you have installed on your computer!
What are they doing in there?
It turns out that the DMG doesn’t “contain” a load of applications.
This is actually a link to your own _global_ Applications folder!
But why would every program have an embedded link to my applications folder?

I eventually discovered, from a colleague, that the DMG is not the program.
The DMG is an _installer_!
And you’re never supposed to double-click on this app icon here at all.
You’re supposed to use drag and drop to copy the Steam.app file into your own Applications folder,
which is very helpfully linked for you.
After that you simply unmount the “disk image” -
for that is, it turns out, what “DMG” stands for -
and then you’re done!

Simple, right?
That’s what the person who designed this DMG thought.
And they helpfully told me that they thought it was simple, by writing “simply drag” in the middle of the DMG.

Now you might be thinking, “Jim, stop complaining. It’s not that hard!!”
As you’ve said, they even wrote the instructions for how to use it,
right there on the screen!
All I had to do was SIMPLY drag and drop a SINGLE icon!

We think of drag-and-drop as one of the most “simple”, “easy”, or “intuitive” actions that we can perform on a computer.
Hell, there are babies that can manage drag-and-drop!
And yet I, a fully fledged adult, working professionally in the software industry, was unable to complete this task.

I may have even read those words “drag and drop” in one of these “disk images”,
but I still didn’t follow the instruction.
Why?
Because the instruction made no sense to me!
I didn’t even consider trying it,
because it didn’t fit my mental model of what this thing is -
an installer.

So, it says “simply drag”, but is using a DMG actually “simple”?
To answer this question, we should think about what the word “simple” means.

There’s an excellent talk by Rich Hickey called “Simple Made Easy”.
He makes a distinction between two words: “simple” vs. “easy”.
We often use these words interchangeably, but in Rich Hickey’s definitions, they’re quite different.
He uses etymology to back this up:
“Simple” is derived from something meaning “one fold”, or “one braid”.
“Easy” is derived from something meaning “lying nearby”.
Simplicity, he says, is about _concepts_, and how they’re intertwined.
Ease, on the other hand, is about _closeness_, how close is this thing to me or to my understanding.
So we can say “X is simple because it only has two concepts, and they’re not intertwined.”
And we can say “X is easy because it’s part of the `bash` shell, and I work with bash every day.”

Rich Hickey’s distinction between simplicity and ease is a very useful one.
And here is my first reason for not using the word “simply”: you probably mean “easily”.
We can see this everywhere when we use the form, “simply do X”.
X is an action!
When we say “simply”, we usually mean “easily”.


I would like very much for the world to stick to Rich Hickey's definition.
If they did, perhaps this instruction would have said, “easily drag”.
Unfortunately, the real world doesn’t stick to this definition!
As such, "easily drag" sounds weird.
So I’ll treat “simple” as meaning some combination of the two things:
“Few, unfolded concepts”, and “near to hand/mind”.

With this distinction in mind, is “using a .dmg” simple? Is it easy? Is it either of these?
Let’s look at what I needed in order to use the .dmg file.
We can categorize these things into _actions_ and _concepts_:

> TODO

Yes, I needed to be able to drag, and to drop.
The things that babies can do.
Dragging and dropping are easy (not simple!).
But there are a bunch of other things I needed in order to complete that task.
There were several CONCEPTS I needed to UNDERSTAND.
I needed to understand that a DMG was not the program. The DMG is the installer.
I needed to understand what “installation” means for macOS - it means “putting it in the Applications folder”.
I needed to understand that this icon represented MY local Applications folder, not something “inside the DMG”.

So there’s this iceberg.
We’re aware of the ACTIONS that need to take place, and we describe those.
But we’re unaware of the CONCEPTS that the reader needs, so we forget to explain those.

So here’s my second reason to not say simply:
you’re probably describing actions, and forgetting concepts.
This is a bias I see in lots of documentation.
We describe actions (how to manipulate this thing), to such a degree that it feels to us like we’ve told people everything.
But we forget to describe the concepts, the things that give the actions any meaning.
We should try consciously to bias towards documenting concepts, not actions.
If you describe the concepts clearly enough, you don’t need to put nearly so much effort into describing actions.

Here’s the most pithy way I could rephrase this: "DRAG TO INSTALL".
It gives you both the concept and the action.
It doesn’t tell you everything, but it gives you some hints and some motivation.

By the way, I said drag-and-drop was “simple”, but how “simple” is it, actually?
There’s a question on the Apple StackExchange site, with thirty-something upvotes,
Asking how to properly drag and drop on a MacBook Pro.
The top answer needed to include a diagram to show how to drag and drop.

I remember a few years ago, my housemate at the time had just bought a brand new top-of-the-line MacBook Pro.
When it finally arrived, he excitedly went into his room to set it up.
Ten minutes later, he came to me and said,
“Jim, have you got a minute? I think the trackpad is broken.”
I went over to his laptop, and he explained to me that he couldn’t click on the “Next” button in the Mac setup.
Now, you’ll notice here, that the Mac trackpad doesn’t have any buttons!
So how on earth do you click?
The answer is that you have to press on the trackpad harder than you do to move the cursor around.
When I showed him, he turned red.
He was clearly embarrassed by this, but he shouldn’t have been!
It’s totally not self-explanatory.
So next time you write the word “simply”, think back to that time you were puzzled about how to click on an Apple trackpad.

I said that, in common understanding, “simple” means a combination of easy actions and few/unfolded concepts.
In both cases, actions and concepts, there will be people for whom this is hard or complex.
All the things you think of as “simple”, there will be many who disagree.

So this is reason #3 for not using the word “simply”.
Using “simply” implies objectivity, “this is innately simple”.
This is incorrect.

So here’s another way you might improve this DMG image: "DRAG".
It’s not simple for everyone, so stop saying it is.

This isn’t a rant about Apple -
but let’s rant about Apple a little bit more.
This is apple.com ten years ago:

> TODO

Back then they ran a major advertising campaign with the slogan, “it just works.”
You probably remember it.
But Apple don’t use the phrase “it just works” any more.
Why?
I think one reason Apple don’t use the phrase “it just works” is due to reactions like this:

> TODO

As soon as it doesn’t “just work” - 
like, I don’t know, when you can’t work out how to click - 
The phrase is absolutely infuriating!

That word “just” in “it just works” functions very similarly to the word “simply”.
You can often swap one for the other.
When I talk about the word “simply”, I’m also including quite a few other phrases in the same category.
Like these ones: "naturally", "merely", "of course", "obviously", "trivially", or my personal favorite, "boom you're done".
I don’t know where it came from.
I’m following your instructions, and then, BOOM! It breaks.
I’m not done!

Reason #4 for not using “simply”: it makes people angry!
Instead of making people angry, perhaps you can try to placate them.
Perhaps you think this example is excessive - people don’t need a help link for a .DMG file.
One thing I find quite placating is a help link, or support email:

> TODO

So far I’ve only picked on just one example - a .dmg image which said “simply drag”.
I picked that example because it’s probably familiar with many people in the room.

But it goes so much further.
I searched for the word “simply” using GitHub search - here are some random examples:

If you want more examples, there are 92 million more if you search on GitHub.

We are infatuated with the word “simply”.
We’re writing technical documentation about complex things.
Yet we use the word “simply” significantly more than the average English text.

In particular, look at Laravel.
This has hundreds of instances of the word “simply”.

This leads to my next reason to not use the word “simply”.
It’s overused, and unimaginative.
Even if you want to use “simply”, at least find something else to use.
Like what?

First, try being more specific.
If you think it’s simple, why do you think it’s simple?
Perhaps you think it’s simple because it doesn’t have any moving parts,
Or because it’s small.
If so, say so - this is a lot better than using the word “simply”

Notice the words I’m using are comparative.
If you think your product is “small”, then, small compared to what?
You must have some bigger thing in mind.
Tell us what it is.
Or if you think your product is quick to set up,
What are you comparing it to?
What takes a long time to set up?
If possible, be comparative.

But better yet, be absolute!
You can often measure, in absolute terms, the quality you think of as “simple”.
If you think your product is “small”, there are metrics for that - e.g. lines of code.
Saying “X requires 5 lines of code” is so much better than “X is simple”.
Or if you think your product is quick to set up, then -
How quick is it to set up, actually?
How long should it take me?
Tell me, “it takes 3 minutes to set it up”!
Now, you’ll noticed I’ve put this one in red.
There’s a trap here, and I’ll get to that in a bit.

Another thing you can to to avoid using “simply” is to instead emphasize the complex parts.
When you say some part of your instructions is simple,
You might have a more complex part of your instructions in mind which you’re comparing to.
If so, emphasize the complexity there instead.
Here’s an example I stumbled over from [jekyll-sitemap](https://github.com/jekyll/jekyll-sitemap),
a Ruby gem I use to make this blog:

> ... be sure to require jekyll-sitemap either after those other gems if you want the sitemap to include the generated content, or before those other gems if you don't want the sitemap to include the generated content from the gems. (Programming is _hard_.)

And as the reader, I was like, “yeah. Programming _is_ hard. This person gets me. We have a bond.”
Now isn’t that so much more friendly to read than if it had said,
“_Simply_ require jekyll-sitemap after those other gems ...”?

Here’s a rather excessive way that you could take the same approach with your DMG:
"Brew some coffee, then drag".

Okay, so I’ve given you a few reasons to not use the word “simply”,
And some other words you can use instead.

But if this doesn’t work, then you should remove it!
And honestly this is the 99% case.
In every case I showed you earlier, removing the word “simply” improves the text.
It’s cleaner and crisper.
No information is lost.
So this leads me to reason #6 to not use the word "simply": it's filler text.
If no information is lost by deleting it, the word is meaningless.
Get rid of it!

Last year I wrote a blog post called “Don’t say simply”.
Later, we ran some internal lightning talks at Pusher.
This is the company I work for.
I gave a lightning talk on this theme - “Don’t say simply”.
I was surprised at how well-received it was.

The reason I decided to do this talk was this thing on our website.
This is a claim on our website: “be up and running in 3 minutes”.
And I wondered, is that possible?
I remembered my own advice: we should make a three-minute walkthrough video to show it instead.
So I tried it!
How long do you think it took me?

8 minutes and 27 seconds.
I WORK FOR THE COMPANY!
I know the process, but it still took me almost three times as long as it claimed.
I couldn’t make a three minute video.

After some compromise, I changed it to “get started in 10 minutes”.
To be honest, That’s still pushing it.
And somehow, we now have references to “5 minutes”.

Here’s an alternative that I found [in the AngularJS tutorial](https://docs.angularjs.org/tutorial).
In the Angular tutorial, they could have written something like,
“You’ll be up and running in three minutes.”
But they didn’t, they were more honest:

> You can go through the whole tutorial in a couple of hours or you may want to spend a pleasant day really digging into it.

I don’t know if it would be _pleasant_ to do so,
But this claim is certainly more honest.
It’s like the example with “programming is hard”.
I see this and I think - okay, this person is being straight with me.

## Why do we do it?

So by now I’ve told you why we shouldn’t use the word “simply”, or its friends.
And I’ve given you some things that you could do instead.
Now I want to spend some time thinking about why we say simply.
Hopefully, if we understand the causes,
we will be able to avoid such mistakes in future.

The primary cause, I think, is that we mistake familiarity for simplicity.
It’s that easy/simple distinction I was talking about, which we all forget about.
We spend hours, weeks, years with something,
And eventually we forget that all the concepts and components of that thing even exist.

When that anonymous designer of the Steam DMG wrote “simply drag”,
they thought of the installation task as composed of the required actions,
but forgot about the required concepts.

Why did the designer forget about the concepts required?
Because that designer had been using a Mac for years.
She had learned these concepts to such an extent that she assumed everyone was aware of them.

The designer's mistake is to forget that this man uses Windows, and this woman uses Linux,
Where there is a completely different set of concepts.
For him, “simplicity” is clicking “Next” ten times.
For her, “simplicity” is typing “apt-get install”.

Here’s reason number 2 that we say “simply”: having developers writing the docs.
This reason really derives from reason #1.
It’s the done thing in most companies, I think, to have developers implementing things and writing the docs for them.
How many times have you heard, “The feature’s done. I just need to write the docs for it!”

Using developers for docs has one advantage: they’re likely to write “accurate” docs, and they’re unlikely to need help doing so.
But there’s one big disadvantage: the developer’s familiarity with their code makes them think that it’s simple.

You might know this meme.
“This is fine”.
Developers seem to love this meme, because they spend their lives like this.
Except when we say “fine”, we could substitute “simple”.

So one solution is to have someone else write the docs.
Someone less familiar with the product, who is likely to uncover the forgotten concepts and complexities.
I’m speaking, I think, to a crowd of technical writers and documentarians.
One reasson you’re better placed to write this stuff is that you’re less familiar with it.

But beware: you’re still going to be much more familiar than the eventual reader,
The person who is reading this stuff precisely because they’re unfamiliar.
So always remember: have sympathy!
Put yourself in the shoes of this person.

If you’ve looked into Haskell, or functional programming,
You might have looked into “monads”, and you may have seen this quote.
I think this quote has become famous (in some circles) because of this word “just”.
If you remove it, the statement becomes a neutral statement,
But with the word “just”, it sounds contemptuous.
“A monad is just this trivial thing - what’s the problem guys?”

Here’s another example, again about monads,
In a blog post which was critiquing the concept of monads.
This post used the word “simply”, like, 20 times,
And I’m quite sure that it was using the word “simply” contemptuously.

Reason 4 - the final one, I promise - is that we treat docs as advertising.
Remember "it just works"?
Sometimes our docs sound like that.
“Run this command, it just works”.

We often blur the lines between advertising and documentation.
GitHub for example encourages this.
That README.md in your repository - is it documentation or an advert?
It’s almost always both, and leads to stuff like this.

We should try to keep the distinction in mind.
If I’m reading your documentation, it’s probably because I’ve waded through your advertising,
And at this point you can be straight with me.

## A script

Based on my newfound realization that the word “simply” is bad,
I did what all developers do: I created a script to fix it.
If you go here,
You’ll find a script which, if you give it the name of a repository,
Will open a PR on that repository,
Which removes all instances of the word “simply”.

Here’s an example of this.
I tried it out on a few repositories I worked with personally.
And in some cases, it went well.
People liked it, and they merged my PRs.

But in other cases, it went badly.
I used my script to submit a PR on the docs for Redis, a popular in-memory database that we use at Pusher.
It was initially merged, but then reverted by antirez, the author of Redis and of the documentation.
He explained to me that he has a quite different meaning of the word “simply”, to emphasize that there is nothing else to do.
More importantly, he explained that not only did he find my pull request wrong, he found it OFFENSIVE.

I felt quite bad after that.
I had offended this person,
who I have a lot of respect for,
whose activity I had followed for several years,
and whose work is integral to the products we make at Pusher.

How did I manage this?
It took some time before I realized that my whole approach was completely hypocritical.
Here’s what my PR may as well have said: “Simply don’t say ‘simply’”.
My approach had a complete lack of empathy.
There is nothing less empathetic than
an automated script
deleting words which you have written,
and telling you that you were wrong.
I had talked of “shaming the reader”,
but what I was doing was shaming the writer.

As antirez had pointed out, it’s not as simple as just deleting all the words.
You need to understand your audience.
You need to evaluate with context.
For this, you really need a human.
This is one of many reasons that I would like to hire a documentarian at Pusher.
This talk isn’t a hiring pitch but this is the obligatory hiring slide.
If you’re ever looking for a job in London, drop us an email.
Here’s mine: jim@pusher.com.
