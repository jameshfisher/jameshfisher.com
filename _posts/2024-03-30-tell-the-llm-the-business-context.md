---
title: Tell the LLM the business context
tags: ["llm", "machine-learning", "programming"]
summary: >-
  Tell LLM why its task is needed and how the output will be used. You'll get better results, but programmers often don't do this because it's anti-modular.
---

Employees do better when they have more business context.
The same is true of LLMs!
To do its best work,
the LLM needs to know why it's being prompted,
where its input came from,
how its output will be used,
and how its output will be judged.
Many prompters try to tell the LLM _how_ to achieve some task,
but it's often better to just give it the business context.

An example.
Your cooking blog has a very plain homepage.
Wouldn't it be nicer, you think, if each link to a blog post included an intro paragraph to draw readers in?
And isn't this the kind of thing an LLM should be great at writing?
So you write your first prompt:

```
Summarize the following article.
```

You run it on your blog posts, but the responses you get are inconsistent and mediocre.
You pile more instructions into the prompt, until you end up with:

```
Summarize the following article.
No more than 2-3 sentences.
Make it engaging so the reader wants to know more.
Never refer to "the post"; instead summarize directly.
Never refer to "the author"; instead use "I".
Here are some examples: ...
```

But the LLM rarely remembers _all_ the rules.
Why is it so stupid, you wonder?

Instead, try telling the LLM the business context.
Here's an alternative prompt:

```
CalebCooks.com is Caleb Smith's blog about cooking.
Each post link on the homepage has the post title, plus a teaser paragraph.
You are given a post's title and content, and you write its teaser paragraph.
The goal is to convince readers to click.
Here's one example: ...
```

Imagine you're describing this task to a contractor.
You wouldn't tell them how many sentences to use;
you'd just tell them the business context.
They'll figure out what's appropriate.

The problem with "Summarize the following article" is that
[the LLM starts out in a superposition](https://www.lesswrong.com/posts/D7PumeYTDPfBTp3i7/the-waluigi-effect-mega-post)
of all the business contexts in which it might have been asked for a summary,
such as:

- "Bob is reading this article.
  He asked me for a "summary" to help understand the article.
  I should guess what Bob's difficulties were in understanding, and re-explain those."
- "Jane is writing an essay that criticizes the arguments in this article.
  She asked me for a "summary" that she'll scan for the argument's weak points."
- "A search system wants to index this page.
  It asked me for a "summary" that it will scan for keywords to index."
- "Caleb is submitting this article to a journal.
  He asked me for a "summary" that he will use as the abstract."

As the LLM produces output, it _collapses_ into one of these contexts.
So some "summaries" will look like critiques;
others will look like keyword lists.

I have seen lots of LLM prompts that avoid providing the business context.
One reason, I think, is that programmers treat the prompting as _programming in English_.
Programmers are used to describing the _how_, but not the _why_.
And programmers love _modularity_, where code is reusable and modules don't know about each other.
But the "business context" principle is anti-modular,
because then the summarization module has knowledge about the whole app and business.
