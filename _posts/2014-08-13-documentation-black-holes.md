---
title: "Documentation black holes: things we write that don’t get read"
tags: ["programming", "documentation"]
---

Nearly all the software I’ve ever contributed to has crappy or non-existent documentation.
The software your company produces is the same.
But, strangely, this is not for lack of writing.
I probably write significantly more English about each feature than I write code to implement it.
So where does all that writing _go_?

It goes into a **documentation black hole.** 
This is a place for written things that will never get read; 
a place where words go to die. 
There are many kinds of documentation black holes:

* **Your internal business documents.**
  Maybe you have worked somewhere where all projects to be signed off before starting. 
  Such sign-off documents will contain a description of what is to be implemented, 
  often in considerable detail. 
  What happens to those documents after they are signed off? 
  They are filed away in a manager’s drawer, 
  never to be seen again. 
  Your project management is a documentation black hole.
* **Your issue tracker.** 
  Your analysts put great effort into describing a new feature 
  so that your developers can implement it. 
  What happens once the feature is implemented? 
  The issue is marked as ‘done’, closed off, and forgotten about forever. 
  Your issue tracker is a documentation black hole.
* **Your test cases.**
  Test cases can be seen as an ‘executable specification’. 
  Your testers translate the issues in your issue tracker 
  from English into hieroglyphics. 
  Your end users cannot read hieroglyphics. 
  Your test suite is a documentation black hole.
* **Your conversations.**
  Your emails get archived. 
  Your instant messages scroll out of sight forever. 
  Your code review comments get lost when new commits are added. 
  Your architectural diagrams on white-boards get wiped off. 
  Your communication is a documentation black hole.
* **Your commit messages.** 
  Some people put great effort into their commit messages, 
  describing exactly what it implements, 
  how it implements it, and why. 
  What happens once that commit is committed? 
  It gets buried under more commits, 
  only accessible by a few expert spelunkers. 
  Your version control is a documentation black hole.
* **Your inline documentation.** 
  Unless your product is a library for other developers, 
  no-one except other developers will read it,
  even if you use a documentation generator and publish it for the world to see.
  Your JavaDoc is a documentation black hole.
* **Your project wiki.** 
  Yes, even your project wiki. 
  Your wiki that you set up expressly for documenting for your product. 
  If it’s anything like all wikis I’ve seen, 
  then even content that *is* there is not read, 
  because no-one trusts it to be up-to-date. 
  Oh, and is the wiki obviously accessible to end users, 
  even if they did want to read it? 
  Probably not. 
  Your documentation is a documentation black hole.

What *isn’t* a documentation black hole? 
A **documentation white hole**, stupid! 
What documentation *does* get read? 
Answering that isn’t so difficult: 
just consider what kinds of things *you* read 
about the software that *you* use. 
Things that I read include:

* **Your product name.** 
  Yes, your product name is documentation. 
  It can sum up everything about the product. 
  ‘GitHub,’ the hub for Git users. 
  No one can use a product without knowing its name. 
  I would bet that the number of times someone has read your product name 
  outnumbers the number of times someone has read *any other word of your documentation, combined*.
* **Your product homepage.** 
  I will visit the website of almost any software I use. 
  I will usually read the first paragraph on that page. 
  I am usually impatient and I expect to know exactly what the product is after reading the first paragraph.
* **Your inline help.** 
  Maybe a form field on your website tells me what it is for. 
  Maybe you have a little expando question-mark button for confused users like me. 
  It will also be read by confused developers of that product in the future, like me. 
  It is documentation.

In science (fiction), 
things that descend into black holes can be ejected from a white hole somewhere else. 
Can we make that happen here? 
Can we link up our documentation black holes to white holes? 
**How can we get more of the words we write into a position to be read?** 
Here are some pieces of advice for that.

* **Your writing effort should be proportional to the number of times you expect it to be read.** 
  The words that get read follow an extreme Pareto distribution. 
  First corollary: spend a *long* time deciding on names! 
  I have seen and worked on all kinds of things where 
  *the freaking project name* was a legacy inheritance; 
  not just meaningless names but *actively deceiving* names.
  You should spend a *long* time giving things well-crafted, poetic names. 
  Second corollary: commit messages should not be essays.
* **Describe planned features using documentation for the implemented feature.** 
  Use the present tense. 
  Don’t write ‘the number in the box must be the sum of the inputs.’
  Instead write, ‘the number in the box *is *the sum of the inputs.’ 
  Then there is no work required to do the documentation.
* **Remove the distinction between your issue tracker and your documentation tracker.** 
  The distinction between ‘issues’ and ‘documentation’ is a false one. 
  Have you ever noticed how much a JIRA and Confluence overlap? 
  Here’s why: an issue in your issue tracker *is* an item of documentation. 
  A ‘feature’ task is just documentation that tells user, 
  ‘sorry, this hasn’t been implemented yet, but we’re working on it.’ 
  A ‘bug’ task is just documentation that tells your users, 
  ‘this isn’t implemented properly at the moment; sorry about that.’ 
  The action of ‘closing a ticket’ corresponds to 
  a flag from documentation that said ‘not implemented yet’.
* **Remove the distinction between your website and your documentation.** 
  The distinction is a false one. 
  I see far too many projects that treat their shiny ‘website’ 
  as an entirely separate component to their documentation, 
  or that treat the documentation as [a hidden-away subcomponent of their website](http://puppetlabs.com/). 
  Wrong. There is no distinction. 
  The *whole website* is documentation. 
  If you tell me that the difference is that 
  ‘documentation is purely factual, but the website is a sales pitch’, 
  then I’ll tell you, 
  *your documentation is also a sales pitch (and stop lying on your website)*. 
  The same process and workflows you use for one should be used for the other.
* **Scrap those stupid business document templates.** 
  Any sign-offs should be against actual, real documentation. 
  If someone wants you to fill in a project description on a form, 
  do it in your documentation first, then copy-paste.
* **Integrate your documentation into the product itself.** 
  Documentation should be as close as possible to the thing on the screen that it describes. 
  Buttons should tell me what they are going to do before I hit them.

**That’s all for now. Get out there and write things that people will read!**

_[This article was previously published here](https://medium.com/@MrJamesFisher/documentation-black-holes-facd0c3b9ed7)._